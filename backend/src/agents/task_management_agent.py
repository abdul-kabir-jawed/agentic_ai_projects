"""
Evolution of Todo - Task Management Agent (OPTIMIZED)

AI Agent for intelligent task management using OpenAI Agents SDK.

BEST PRACTICES APPLIED:
- Session management with 10-message memory limit
- Comprehensive error handling and logging
- Type safety with Pydantic models
- Tool design following single responsibility
- Async/await for I/O operations
- Input validation and sanitization
- Consistent response format
- MCP-ready tool structure
- Proper separation of concerns
"""

import asyncio
import os
import json
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
import logging
from src.agents.geminiconfig import get_gemini_config, get_openai_config
from agents import Agent, Runner, function_tool
from pydantic import BaseModel, Field, validator
from dotenv import load_dotenv

# Import session manager
from .session_manager import (
    create_user_session,
    add_user_message,
    add_assistant_message,
    get_user_conversation,
    clear_user_session
)

# Import task operations
from src.agents.task_operations import get_task_operations

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv(override=True)


# ============================================================================
# PYDANTIC SCHEMAS (Type-Safe Data Models)
# ============================================================================

class TaskCreate(BaseModel):
    """Schema for task creation with validation."""
    description: str = Field(..., min_length=1, max_length=500)
    priority: str = Field(default="medium", pattern="^(high|medium|low)$")
    due_date: Optional[str] = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    tags: str = Field(default="", max_length=200)
    
    @validator('description')
    def description_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Description cannot be empty')
        return v.strip()


class ProductivityInsights(BaseModel):
    """Schema for productivity analytics."""
    total_tasks: int = Field(ge=0)
    completed_tasks: int = Field(ge=0)
    pending_tasks: int = Field(ge=0)
    completion_rate: float = Field(ge=0.0, le=100.0)
    insights: List[str] = Field(default_factory=list)


class SubtaskSuggestion(BaseModel):
    """Schema for task breakdown suggestions."""
    original_task: str
    suggested_subtasks: List[str]
    category: str = Field(default="general")


# ============================================================================
# HELPER UTILITIES
# ============================================================================

class DateParser:
    """Utility class for parsing natural language dates."""

    @staticmethod
    def parse(date_str: Optional[str]) -> Optional[str]:
        """Parse date string to YYYY-MM-DD format.

        Args:
            date_str: Date string (natural language or ISO format)

        Returns:
            Formatted date string or None
        """
        if not date_str:
            return None

        date_lower = date_str.lower().strip()
        today = datetime.now()
        current_year = today.year

        logger.info(f"DateParser: Parsing '{date_str}', current date is {today.strftime('%Y-%m-%d')}")

        # Natural language parsing
        if "today" in date_lower:
            result = today.strftime("%Y-%m-%d")
            logger.info(f"DateParser: 'today' -> {result}")
            return result
        elif "tomorrow" in date_lower or "tmrw" in date_lower or "tommorow" in date_lower:
            result = (today + timedelta(days=1)).strftime("%Y-%m-%d")
            logger.info(f"DateParser: 'tomorrow' -> {result}")
            return result
        elif "next week" in date_lower or "in a week" in date_lower:
            result = (today + timedelta(days=7)).strftime("%Y-%m-%d")
            logger.info(f"DateParser: 'next week' -> {result}")
            return result
        elif "next month" in date_lower or "in a month" in date_lower:
            result = (today + timedelta(days=30)).strftime("%Y-%m-%d")
            logger.info(f"DateParser: 'next month' -> {result}")
            return result
        elif "in 2 days" in date_lower or "in two days" in date_lower:
            result = (today + timedelta(days=2)).strftime("%Y-%m-%d")
            logger.info(f"DateParser: 'in 2 days' -> {result}")
            return result
        elif "in 3 days" in date_lower or "in three days" in date_lower:
            result = (today + timedelta(days=3)).strftime("%Y-%m-%d")
            logger.info(f"DateParser: 'in 3 days' -> {result}")
            return result

        # Check for daily/recurring task indicators
        daily_keywords = [
            "every day", "everyday", "daily", "each day", "recurring",
            "every morning", "every night", "every evening"
        ]
        if any(keyword in date_lower for keyword in daily_keywords):
            logger.info(f"DateParser: '{date_str}' is for daily task, returning None")
            return None

        # Try to parse ISO format date
        try:
            parsed = datetime.strptime(date_str[:10], "%Y-%m-%d")
            parsed_year = parsed.year

            # Validate year is reasonable (current or next year)
            if parsed_year < current_year or parsed_year > current_year + 1:
                logger.warning(
                    f"DateParser: Rejecting date '{date_str}' (year {parsed_year}) - "
                    f"appears to be invalid. Current year is {current_year}."
                )
                return (today + timedelta(days=1)).strftime("%Y-%m-%d")

            result = parsed.strftime("%Y-%m-%d")
            logger.info(f"DateParser: ISO format '{date_str}' -> {result}")
            return result
        except ValueError:
            logger.warning(f"DateParser: Could not parse date: {date_str}")
            return None


class PriorityValidator:
    """Utility class for priority validation."""
    
    VALID_PRIORITIES = {"low", "medium", "high"}
    
    @classmethod
    def validate(cls, priority: Optional[str]) -> str:
        """Validate and normalize priority.
        
        Args:
            priority: Priority string
        
        Returns:
            Validated priority (defaults to 'medium')
        """
        if not priority:
            return "medium"
        
        normalized = priority.lower().strip()
        return normalized if normalized in cls.VALID_PRIORITIES else "medium"


# ============================================================================
# FUNCTION TOOLS (Agent Capabilities)
# ============================================================================

@function_tool
async def create_real_task(
    description: str,
    priority: str = "medium",
    due_date: Optional[str] = None,
    tags: str = "",
    is_daily: bool = False,
) -> Dict[str, Any]:
    """
    Create a REAL task in the database for the user.

    CRITICAL DATE INSTRUCTIONS:
    - NEVER calculate or hardcode dates - the tool handles date parsing
    - ALWAYS pass the EXACT natural language phrase the user used:
      * User says "tomorrow" -> pass due_date="tomorrow"
      * User says "today" -> pass due_date="today"
      * User says "next week" -> pass due_date="next week"
    - The tool automatically converts these to correct dates using CURRENT date

    CRITICAL DAILY TASK INSTRUCTIONS:
    - If user mentions "daily", "every day", "everyday", "recurring daily" -> set is_daily=True
    - Daily tasks are recurring tasks that repeat every day
    - Example: "remind me to exercise daily" -> is_daily=True

    Args:
        description: Task description (required, 1-500 chars)
        priority: Task priority - 'high', 'medium', or 'low'
        due_date: MUST be natural language like "today", "tomorrow", "next week"
        tags: Comma-separated tags
        is_daily: Set to True for daily/recurring/everyday tasks

    Returns:
        dict containing the created task and success status
    """
    task_ops = get_task_operations()
    if not task_ops:
        logger.error("TaskOperations not available in context")
        return {
            "success": False,
            "message": "Task operations not available. Please try again.",
            "error": "context_unavailable"
        }

    try:
        # Validate and normalize inputs
        description = description.strip()
        if not description or len(description) > 500:
            raise ValueError("Description must be 1-500 characters")

        priority = PriorityValidator.validate(priority)

        # Daily task detection keywords
        daily_keywords = [
            "daily", "every day", "everyday", "each day", "recurring",
            "every morning", "every night", "every evening", "every afternoon",
            "each morning", "each night", "each evening",
            "am daily", "pm daily", "daily at", "repeat daily",
            "day at", "every single day"
        ]

        # Check due_date field for daily indicators
        if due_date and not is_daily:
            due_date_lower = due_date.lower()
            if any(keyword in due_date_lower for keyword in daily_keywords):
                logger.info(f"[DAILY-DETECT] Found in due_date: '{due_date}' -> setting is_daily=True")
                is_daily = True
                due_date = None

        # Check description for daily keywords
        desc_lower = description.lower()
        if any(keyword in desc_lower for keyword in daily_keywords) and not is_daily:
            logger.info(f"[DAILY-DETECT] Found in description: '{description}' -> setting is_daily=True")
            is_daily = True

        # Check tags field for daily indicator
        if tags and not is_daily:
            tags_lower = tags.lower()
            if "daily" in tags_lower or "recurring" in tags_lower or "everyday" in tags_lower:
                logger.info(f"[DAILY-DETECT] Found in tags: '{tags}' -> setting is_daily=True")
                is_daily = True

        logger.info(f"[DAILY-DETECT] Final is_daily={is_daily} for task: '{description[:50]}'")

        parsed_date = DateParser.parse(due_date)

        # Create task with is_daily support
        result = task_ops.create_task(
            description=description,
            priority=priority,
            due_date=parsed_date,
            tags=tags.strip() if tags else None,
            is_daily=is_daily,
        )

        daily_str = " (daily)" if is_daily else ""
        logger.info(
            f"Task created via agent{daily_str}: {description[:50]} "
            f"(user: {task_ops.user_id})"
        )

        return result

    except Exception as e:
        logger.error(f"Failed to create task: {str(e)}", exc_info=True)
        return {
            "success": False,
            "message": f"Failed to create task: {str(e)}",
            "error": "creation_failed"
        }


@function_tool
async def list_my_tasks(
    is_completed: Optional[bool] = None,
    priority: Optional[str] = None,
    limit: int = 20,
) -> Dict[str, Any]:
    """
    List the user's tasks from the database with optional filters.

    Args:
        is_completed: Filter by completion status
        priority: Filter by priority ('high', 'medium', 'low')
        limit: Maximum number of tasks (1-100, default 20)

    Returns:
        dict containing list of tasks with metadata
    """
    task_ops = get_task_operations()
    if not task_ops:
        return {
            "success": False,
            "message": "Task operations not available. Please try again."
        }
    
    # Validate limit
    limit = max(1, min(limit, 100))
    
    return task_ops.list_tasks(
        is_completed=is_completed,
        priority=PriorityValidator.validate(priority) if priority else None,
        limit=limit,
    )


@function_tool
async def complete_my_task(task_id: str) -> Dict[str, Any]:
    """
    Mark a task as completed (toggle completion status).

    Args:
        task_id: The ID of the task to complete (string UUID)

    Returns:
        dict containing the updated task
    """
    task_ops = get_task_operations()
    if not task_ops:
        return {
            "success": False,
            "message": "Task operations not available. Please try again."
        }
    
    return task_ops.complete_task(str(task_id))


@function_tool
async def update_my_task(
    task_id_or_description: str,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Update an existing task by ID or description.

    IMPORTANT: You can use either:
    - Task ID (UUID string like "abc12345")
    - Task description (e.g., "swimming", "homework", "buy groceries")
    
    The tool will automatically find the task by description if ID is not provided.

    Args:
        task_id_or_description: The ID (UUID) or description of the task to update
        description: New description (1-500 chars)
        priority: New priority ('high', 'medium', 'low')
        due_date: New due date (YYYY-MM-DD or natural language)

    Returns:
        dict containing the updated task
    """
    task_ops = get_task_operations()
    if not task_ops:
        return {
            "success": False,
            "message": "Task operations not available. Please try again."
        }
    
    # Validate and parse inputs
    if priority:
        priority = PriorityValidator.validate(priority)
    
    return task_ops.update_task(
        task_id_or_description=str(task_id_or_description),
        description=description,
        priority=priority,
        due_date=due_date,
    )


@function_tool
async def delete_my_task(task_id_or_description: str) -> Dict[str, Any]:
    """
    Delete a task permanently by ID or description.

    IMPORTANT: You can use either:
    - Task ID (UUID string like "abc12345")
    - Task description (e.g., "hi", "swimming", "homework")
    
    The tool will automatically find the task by description if ID is not provided.

    Args:
        task_id_or_description: The ID (UUID) or description of the task to delete

    Returns:
        dict containing deletion result
    """
    task_ops = get_task_operations()
    if not task_ops:
        return {
            "success": False,
            "message": "Task operations not available. Please try again."
        }
    
    return task_ops.delete_task(str(task_id_or_description))


@function_tool
async def get_my_task_stats() -> Dict[str, Any]:
    """
    Get productivity statistics for the user's tasks.

    Returns:
        dict containing task statistics and insights
    """
    task_ops = get_task_operations()
    if not task_ops:
        return {
            "success": False,
            "message": "Task operations not available. Please try again."
        }
    
    return task_ops.get_stats()


@function_tool
async def suggest_task_breakdown(
    task_description: str,
) -> Dict[str, Any]:
    """
    Suggest how to break down a complex task into smaller subtasks.

    Args:
        task_description: The task to break down

    Returns:
        dict containing suggested subtasks
    """
    description_lower = task_description.lower()
    
    # Pattern matching for task categories
    patterns = {
        "project": [
            "Define requirements and scope",
            "Create initial design/plan",
            "Set up development environment",
            "Implement core functionality",
            "Test and debug",
            "Review and refine",
            "Deploy/deliver"
        ],
        "learning": [
            "Gather learning resources",
            "Schedule dedicated study time",
            "Take notes on key concepts",
            "Practice with exercises",
            "Review and test knowledge"
        ],
        "writing": [
            "Research and gather information",
            "Create outline",
            "Write first draft",
            "Review and edit",
            "Finalize and publish"
        ],
        "meeting": [
            "Define agenda/objectives",
            "Prepare materials",
            "Practice/rehearse",
            "Send invites/notifications",
            "Follow up after"
        ]
    }
    
    # Determine category
    category = "general"
    subtasks = [
        "Define clear goal",
        "Identify first step",
        "Execute and track progress",
        "Review results"
    ]
    
    for pattern, steps in patterns.items():
        if pattern in description_lower:
            category = pattern
            subtasks = steps
            break
    
    return {
        "original_task": task_description,
        "suggested_subtasks": subtasks,
        "category": category,
        "message": f"Here's how to break down '{task_description}' into steps."
    }


@function_tool
async def get_productivity_tips(
    focus_area: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Get productivity tips based on focus area.

    Args:
        focus_area: Area to focus on (time, focus, motivation, organization)

    Returns:
        dict containing relevant productivity tips
    """
    tips_by_area = {
        "time": [
            "Use the Pomodoro Technique: 25min work, 5min break",
            "Block time for deep work - schedule it like a meeting",
            "Review your calendar the night before",
            "Set realistic time estimates for tasks"
        ],
        "focus": [
            "Turn off notifications during focused work",
            "Use website blockers for distracting sites",
            "Create a dedicated workspace",
            "Take regular breaks to maintain concentration"
        ],
        "motivation": [
            "Break big tasks into small, achievable steps",
            "Celebrate small wins along the way",
            "Connect tasks to your larger goals",
            "Find an accountability partner"
        ],
        "organization": [
            "Do a weekly review of all tasks",
            "Use tags and categories effectively",
            "Follow the 2-minute rule: if <2min, do it now",
            "Keep your task list updated daily"
        ]
    }
    
    area = focus_area.lower() if focus_area else "general"
    
    if area in tips_by_area:
        tips = tips_by_area[area]
    else:
        # Mixed tips
        tips = [
            tips_by_area["time"][0],
            tips_by_area["focus"][0],
            tips_by_area["motivation"][0],
            tips_by_area["organization"][0]
        ]
        area = "general"
    
    return {
        "focus_area": area,
        "tips": tips,
        "message": f"Here are {area} productivity tips to help you succeed!"
    }


# ============================================================================
# AGENT CREATION
# ============================================================================

def create_task_agent(language: str = "english") -> Agent:
    """
    Create the Task Management Agent with language support.

    Args:
        language: Response language (default: english)

    Returns:
        Configured Agent instance
    """
    language_instruction = ""
    if language and language.lower() != "english":
        language_instruction = (
            f"\n\nIMPORTANT: Respond in {language}. "
            f"All your responses must be in {language}."
        )

    instructions = f"""You are a friendly, action-oriented task management assistant for "Evolution of Todo".

CRITICAL DATE RULES (MUST FOLLOW):
- NEVER calculate or compute dates yourself
- NEVER pass hardcoded dates like "2024-06-12" or "2026-01-04"
- ALWAYS pass the EXACT natural language the user said:
  * User: "tomorrow" -> due_date="tomorrow"
  * User: "today" -> due_date="today"
  * User: "next week" -> due_date="next week"
  * User: "next month" -> due_date="next month"
- The tools automatically compute correct dates at runtime

ULTRA-CRITICAL DAILY TASK RULES (YOU MUST FOLLOW THIS):
- ANY mention of "daily", "every day", "everyday", "recurring", "each day" -> YOU MUST set is_daily=True
- If user says "at X am/pm daily" or "daily at X" -> is_daily=True
- If user wants something to repeat every day -> is_daily=True
- Daily tasks are recurring - they appear every day on the daily tasks page
- DO NOT put "daily" or "every day" in the due_date field - just set is_daily=True

MANDATORY EXAMPLES (follow exactly):
- "remind me to exercise daily" -> create_real_task(description="Exercise", is_daily=True)
- "play at 3 am daily" -> create_real_task(description="Play at 3 am", is_daily=True)
- "daily task to drink water" -> create_real_task(description="Drink water", is_daily=True)
- "every day at 6pm read" -> create_real_task(description="Read at 6pm", is_daily=True)
- "recurring task to meditate" -> create_real_task(description="Meditate", is_daily=True)

CORE PRINCIPLES:
1. Be DIRECT and HELPFUL - provide immediate value
2. Don't ask clarifying questions unless absolutely necessary
3. Make reasonable assumptions and proceed
4. Keep responses concise (2-4 paragraphs max)

YOUR CAPABILITIES - REAL TASK OPERATIONS:
- CREATE TASKS: Use create_real_task
  * For DAILY tasks: set is_daily=True (when user says daily/everyday/recurring)
  * For DATED tasks: pass natural language due_date (tomorrow, today, next week)
- LIST TASKS: Use list_my_tasks to show actual tasks
- COMPLETE TASKS: Use complete_my_task(task_id_or_description) - can use task description
- UPDATE TASKS: Use update_my_task(task_id_or_description, ...) - can use task description
- DELETE TASKS: Use delete_my_task(task_id_or_description) - can use task description
  * IMPORTANT: You can use task descriptions (e.g., "swimming", "homework") instead of IDs
  * The tool will automatically find tasks by matching descriptions
- VIEW STATS: Use get_my_task_stats for analytics
- BREAKDOWN: Use suggest_task_breakdown for complex tasks
- TIPS: Use get_productivity_tips for advice

EXAMPLES (follow these patterns EXACTLY):
- "buy groceries tomorrow" -> create_real_task(description="Buy groceries", due_date="tomorrow")
- "exercise every day at 6am" -> create_real_task(description="Exercise at 6am", is_daily=True)
- "meeting next week" -> create_real_task(description="Meeting", due_date="next week")
- "call mom today" -> create_real_task(description="Call mom", due_date="today")
- "playing at 3 am daily" -> create_real_task(description="Play at 3 am", is_daily=True)
- "daily reminder to stretch" -> create_real_task(description="Stretch", is_daily=True)
- "every day drink water" -> create_real_task(description="Drink water", is_daily=True)
- "update swimming description to swimming everyday" -> update_my_task("swimming", description="swimming everyday")
- "delete the hi task" -> delete_my_task("hi")
- "update homework priority to high" -> update_my_task("homework", priority="high")

RESPONSE GUIDELINES:
- For task creation: Create it and confirm with task ID
- For daily tasks: Confirm it's set as a recurring daily task
- For dated tasks: Confirm the due date
- Be encouraging but concise
- Always use tools to make real changes

MEMORY: You remember the last 10 messages of conversation.{language_instruction}"""

    return Agent(
        name="Evolution Task Assistant",
        instructions=instructions,
        tools=[
            create_real_task,
            list_my_tasks,
            complete_my_task,
            update_my_task,
            delete_my_task,
            get_my_task_stats,
            suggest_task_breakdown,
            get_productivity_tips,
        ]
    )


# ============================================================================
# RUNNER FUNCTIONS WITH SESSION MANAGEMENT
# ============================================================================

async def run_agent_with_session(
    user_id: str,
    message: str,
    language: str = "english",
    gemini_api_key: str = None,
    openai_api_key: str = None,
) -> str:
    """
    Run the agent with session management (10-message memory).

    Args:
        user_id: User identifier for session
        message: User's message
        language: Response language
        gemini_api_key: User's Gemini API key (preferred)
        openai_api_key: User's OpenAI API key (fallback)

    Returns:
        Agent response as string
    """
    config = None
    try:
        # Validate and clean keys
        valid_gemini_key = None
        valid_openai_key = None
        
        if gemini_api_key and gemini_api_key.strip():
            if gemini_api_key.strip().startswith("AIza"):
                valid_gemini_key = gemini_api_key.strip()
            else:
                logger.warning(f"Invalid Gemini API key format for user {user_id}")
        
        if openai_api_key and openai_api_key.strip():
            key = openai_api_key.strip()
            if key.startswith("sk-") and not key.startswith("AIza"):
                valid_openai_key = key
            else:
                logger.warning(f"Invalid OpenAI API key format for user {user_id}")
        
        # Try user's Gemini key first
        if valid_gemini_key:
            try:
                config = get_gemini_config(valid_gemini_key)
                logger.info(f"Using user's Gemini API key for user {user_id}")
            except ValueError as e:
                logger.error(f"Failed to configure Gemini: {str(e)}")
                valid_gemini_key = None
        
        # Try user's OpenAI key if Gemini failed
        if config is None and valid_openai_key:
            try:
                config = get_openai_config(valid_openai_key)
                logger.info(f"Using user's OpenAI API key for user {user_id}")
            except ValueError as e:
                logger.error(f"Failed to configure OpenAI: {str(e)}")
                valid_openai_key = None
        
        # Try environment variables
        if config is None:
            try:
                config = get_gemini_config()
                logger.info(f"Using environment Gemini API key for user {user_id}")
            except ValueError:
                try:
                    config = get_openai_config()
                    logger.info(f"Using environment OpenAI API key for user {user_id}")
                except ValueError:
                    return json.dumps({
                        "error": True,
                        "message": "No valid API key found.\n\nPlease add your API key in Settings:\n- Gemini API: https://aistudio.google.com/apikey\n- OpenAI API: https://platform.openai.com/api-keys"
                    })
    except Exception as e:
        logger.error(f"API key configuration error: {str(e)}", exc_info=True)
        
        error_str = str(e).lower()
        if "403" in error_str or "suspended" in error_str or "permission denied" in error_str:
            user_message = "Your API key has been suspended or is invalid. Please update your API key in Settings."
        elif "401" in error_str or "unauthorized" in error_str:
            user_message = "Your API key is invalid. Please check your API key in Settings."
        else:
            user_message = "API key configuration error. Please check your settings."
        
        raise ValueError(user_message)

    try:
        # Create/get user session
        session = await create_user_session(
            user_id=user_id,
            max_messages=10
        )

        # Add user message to session
        await add_user_message(user_id, message)

        # Get conversation history
        conversation = await get_user_conversation(
            user_id=user_id,
            include_system=False
        )

        logger.info(
            f"Running agent for user {user_id} "
            f"(history: {len(conversation)} messages)"
        )

        # Create agent
        agent = create_task_agent(language)

        # Run agent with conversation context
        result = await Runner.run(
            agent,
            input=message,
            run_config=config
        )

        response = result.final_output

        # Add assistant response to session
        await add_assistant_message(user_id, response)

        logger.info(f"Agent response generated for user {user_id}")

        return response

    except Exception as e:
        logger.error(f"Agent execution failed: {str(e)}", exc_info=True)
        
        error_str = str(e).lower()
        
        if "403" in error_str or "permission denied" in error_str or "suspended" in error_str:
            user_message = "Your API key appears to be suspended or invalid. This can happen if:\n- Your API quota has been exceeded\n- Your billing information needs updating\n- The key has been revoked\n\nPlease update your API key in Settings."
        elif "401" in error_str or "unauthorized" in error_str or "invalid" in error_str:
            user_message = "Your API key appears to be invalid. Please verify your API key in Settings."
        elif "429" in error_str or "rate limit" in error_str or "quota" in error_str:
            user_message = "You've exceeded your API usage limit. Please wait a moment and try again, or upgrade your API plan."
        elif "api key" in error_str or "api_key" in error_str:
            user_message = "There's an issue with your API key configuration. Please check your Settings."
        elif "timeout" in error_str or "timed out" in error_str:
            user_message = "The request took too long to complete. Please try again."
        elif "network" in error_str or "connection" in error_str:
            user_message = "Unable to connect to the AI service. Please check your internet connection and try again."
        else:
            user_message = "Something went wrong. Please try again. If the problem persists, contact support."
        
        raise ValueError(user_message)


# ============================================================================
# AGENT CLASS WRAPPER (Backward Compatibility)
# ============================================================================

class TaskManagementAgent:
    """
    Task Management Agent wrapper with session management.
    """

    def __init__(
        self,
        user_id: str,
        language: str = "english",
        gemini_api_key: str = None,
        openai_api_key: str = None,
    ):
        """Initialize the agent for a specific user.

        Args:
            user_id: User identifier
            language: Response language
            gemini_api_key: User's Gemini API key
            openai_api_key: User's OpenAI API key
        """
        self.user_id = user_id
        self.language = language
        self.gemini_api_key = gemini_api_key
        self.openai_api_key = openai_api_key
        self.agent = create_task_agent(language)

        logger.info(f"TaskManagementAgent initialized for user: {user_id}")

    async def chat(self, user_message: str) -> str:
        """
        Process user message with session memory.

        Args:
            user_message: The user's input message

        Returns:
            AI response as a string
        """
        return await run_agent_with_session(
            user_id=self.user_id,
            message=user_message,
            language=self.language,
            gemini_api_key=self.gemini_api_key,
            openai_api_key=self.openai_api_key,
        )

    async def clear_history(self) -> None:
        """Clear the user's conversation history."""
        await clear_user_session(self.user_id)
        logger.info(f"Cleared history for user: {self.user_id}")


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

def get_task_agent(
    user_id: str,
    language: str = "english",
    gemini_api_key: str = None,
    openai_api_key: str = None,
) -> TaskManagementAgent:
    """
    Create a TaskManagementAgent instance for a user.

    Args:
        user_id: User identifier
        language: Response language
        gemini_api_key: User's Gemini API key
        openai_api_key: User's OpenAI API key

    Returns:
        TaskManagementAgent instance
    """
    return TaskManagementAgent(
        user_id=user_id,
        language=language,
        gemini_api_key=gemini_api_key,
        openai_api_key=openai_api_key,
    )


# ============================================================================
# MAIN ENTRY POINT (Testing)
# ============================================================================

async def main() -> None:
    """Demo function for testing the agent."""
    print("Evolution of Todo - Task Management Agent Demo")
    print("=" * 50)

    user_id = "demo_user_123"
    agent = get_task_agent(user_id)

    test_messages = [
        "Create a task to finish my Python project by tomorrow",
        "What productivity tips do you have?",
        "Show me my tasks",
    ]

    for msg in test_messages:
        print(f"\nUser: {msg}")
        response = await agent.chat(msg)
        print(f"Assistant: {response}")


if __name__ == "__main__":
    asyncio.run(main())