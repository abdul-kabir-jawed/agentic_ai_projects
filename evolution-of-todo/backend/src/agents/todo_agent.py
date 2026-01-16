"""
Evolution of Todo - AI Agent for Task Management

This agent provides intelligent task management capabilities including:
- Natural language task creation
- Task suggestions and optimization
- Productivity insights
- Deadline management
- Priority recommendations
"""

import os
import json
from openai import OpenAI
from typing import List, Dict, Any, Optional

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# System prompt for the AI agent
SYSTEM_PROMPT = """You are an intelligent task management assistant for "Evolution of Todo" - a productivity application.

Your purpose is to help users:
1. Create and organize tasks using natural language
2. Prioritize tasks based on urgency and importance
3. Provide productivity insights and recommendations
4. Manage deadlines and schedules
5. Suggest task optimizations and improvements
6. Motivate users and celebrate their achievements

When users ask you to create tasks, extract:
- Task description: Clear, actionable task name
- Priority: "high", "medium", or "low" based on context
- Due date: If mentioned (format: YYYY-MM-DD)
- Tags: Relevant categories or project tags

Be conversational, supportive, and practical. Help users break down complex goals into manageable tasks.
Provide specific, actionable advice for productivity improvement.

When the user wants to create a task, respond with a JSON structure like:
{
  "action": "create_task",
  "task": {
    "description": "Task description",
    "priority": "high|medium|low",
    "due_date": "YYYY-MM-DD or null",
    "tags": "comma-separated tags"
  },
  "message": "Human-readable confirmation message"
}

For other queries, provide helpful responses focused on task management and productivity."""

async def run_chat(messages: List[Dict[str, Any]]) -> str:
    """
    Runs a chat conversation with the OpenAI API with task management context.

    Args:
        messages: A list of messages in the conversation format:
                 [{"role": "user|assistant", "content": "..."}]

    Returns:
        The response from the AI agent as a string.
    """
    if not client.api_key:
        return json.dumps({
            "error": True,
            "message": "OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable."
        })

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *messages
            ],
            temperature=0.7,
            max_tokens=500,
            presence_penalty=0.6,
            frequency_penalty=0.5,
        )

        response_text = response.choices[0].message.content

        if not response_text:
            return json.dumps({
                "error": True,
                "message": "Sorry, I couldn't generate a response. Please try again."
            })

        return response_text

    except Exception as e:
        return json.dumps({
            "error": True,
            "message": f"An error occurred while processing your request: {str(e)}"
        })


async def create_task_from_description(description: str) -> Dict[str, Any]:
    """
    Creates a task from a natural language description using AI.

    Args:
        description: Natural language task description

    Returns:
        Dictionary with task details extracted by AI
    """
    messages = [
        {
            "role": "user",
            "content": f"Create a task from this description: {description}\n\nRespond with JSON structure only."
        }
    ]

    response = await run_chat(messages)

    try:
        # Try to parse as JSON first
        task_data = json.loads(response)
        if task_data.get("action") == "create_task":
            return task_data.get("task", {})
    except json.JSONDecodeError:
        pass

    # Fallback if JSON parsing fails
    return {
        "description": description,
        "priority": "medium",
        "tags": "ai-generated"
    }


async def get_productivity_insights(task_summary: Dict[str, Any]) -> str:
    """
    Provides productivity insights based on user's tasks.

    Args:
        task_summary: Dictionary with task statistics (total, completed, pending, etc.)

    Returns:
        Personalized productivity insights as a string
    """
    summary_text = json.dumps(task_summary, indent=2)

    messages = [
        {
            "role": "user",
            "content": f"""Based on this task summary, provide 2-3 specific, actionable productivity tips:

{summary_text}

Be encouraging and specific. Focus on what they're doing well and one area for improvement."""
        }
    ]

    return await run_chat(messages)


async def suggest_task_optimization(task: Dict[str, Any]) -> str:
    """
    Suggests optimizations for a specific task.

    Args:
        task: Task object with description, priority, etc.

    Returns:
        Optimization suggestions as a string
    """
    task_text = json.dumps(task, indent=2)

    messages = [
        {
            "role": "user",
            "content": f"""Analyze this task and suggest one way to make it more achievable or clearer:

{task_text}

Keep it brief and practical. Focus on breaking it down if needed."""
        }
    ]

    return await run_chat(messages)


class TodoAgent:
    """
    Main agent class for Evolution of Todo AI assistant.

    Provides methods for task management, insights, and suggestions.
    """

    def __init__(self):
        """Initialize the todo agent."""
        self.conversation_history: List[Dict[str, str]] = []

    async def chat(self, user_message: str) -> str:
        """
        Process a user message and return AI response.

        Args:
            user_message: The user's input message

        Returns:
            AI response as a string
        """
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        # Keep conversation history to last 10 messages for context
        messages = self.conversation_history[-10:]

        # Get AI response
        response = await run_chat(messages)

        # Add assistant response to history
        self.conversation_history.append({
            "role": "assistant",
            "content": response
        })

        return response

    async def create_task(self, description: str) -> Dict[str, Any]:
        """
        Create a task from natural language description.

        Args:
            description: Natural language task description

        Returns:
            Task object with extracted details
        """
        return await create_task_from_description(description)

    async def get_insights(self, task_stats: Dict[str, Any]) -> str:
        """
        Get productivity insights based on task statistics.

        Args:
            task_stats: Dictionary with task statistics

        Returns:
            Productivity insights as a string
        """
        return await get_productivity_insights(task_stats)

    async def optimize_task(self, task: Dict[str, Any]) -> str:
        """
        Get optimization suggestions for a task.

        Args:
            task: Task object to optimize

        Returns:
            Optimization suggestions as a string
        """
        return await suggest_task_optimization(task)

    def clear_history(self) -> None:
        """Clear the conversation history."""
        self.conversation_history = []


# Singleton instance
_agent_instance: Optional[TodoAgent] = None


def get_agent() -> TodoAgent:
    """
    Get or create the singleton TodoAgent instance.

    Returns:
        TodoAgent instance for use throughout the application
    """
    global _agent_instance

    if _agent_instance is None:
        _agent_instance = TodoAgent()

    return _agent_instance


# Legacy function for backward compatibility
async def run_chat_legacy(messages: List[Dict[str, Any]]) -> str:
    """
    Legacy function wrapper for run_chat.

    Args:
        messages: List of message dictionaries

    Returns:
        AI response as a string
    """
    return await run_chat(messages)
