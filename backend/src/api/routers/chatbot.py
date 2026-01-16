"""Chatbot API router for natural language todo management with user API keys."""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Annotated
import os
import asyncio
import logging

from sqlmodel import Session

# Configure logger
logger = logging.getLogger(__name__)

from src.auth.dependencies import get_current_user, BetterAuthUser
from src.db.database import get_session
from src.repositories.user_data_repository import UserDataRepository
from src.agents.task_operations import TaskOperations, set_task_operations, clear_task_operations

# Import the task management agent
from src.agents.task_management_agent import run_agent_with_session, get_task_agent

router = APIRouter(prefix="/chat", tags=["chatbot"])


class ChatMessage(BaseModel):
    """Chat message structure."""
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    """Chat request from client."""
    messages: List[ChatMessage]
    language: Optional[str] = "english"


class ChatResponse(BaseModel):
    """Chat response to client."""
    content: str
    agent_type: Optional[str] = None


class ChatHistoryResponse(BaseModel):
    """Chat history response."""
    messages: List[Dict[str, Any]]
    total: int


class ClearHistoryResponse(BaseModel):
    """Response for clearing chat history."""
    deleted: int
    message: str


class ApiKeyCheckResponse(BaseModel):
    """Response for API key check."""
    has_api_keys: bool
    gemini_configured: bool
    openai_configured: bool
    can_use_chat: bool


@router.get("/api-key-check", response_model=ApiKeyCheckResponse)
async def check_api_keys(
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> ApiKeyCheckResponse:
    """
    Check if user has API keys configured for chat access.

    Args:
        current_user: Authenticated Better Auth user
        session: Database session

    Returns:
        API key configuration status
    """
    repo = UserDataRepository(session)
    status = repo.get_api_keys_status(current_user.id)
    
    logger.info(f"[API_KEY_CHECK] User {current_user.id} status: {status}")

    # Only check user's keys - no environment fallback for can_use_chat
    # User must provide their own API keys to use chat
    can_use_chat = status.get("has_any", False)
    
    logger.info(f"[API_KEY_CHECK] User {current_user.id} can_use_chat: {can_use_chat}")

    return ApiKeyCheckResponse(
        has_api_keys=status.get("has_any", False),
        gemini_configured=status.get("gemini_configured", False),
        openai_configured=status.get("openai_configured", False),
        can_use_chat=can_use_chat,
    )


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> ChatResponse:
    """
    Process a natural language chat message using the task management agent.

    Requires authentication. Messages are persisted to the database (max 10, FIFO).
    Uses user's API keys for AI requests.

    Features:
    - Natural language task creation (REAL database operations)
    - Task listing, completion, deletion
    - Productivity insights
    - Task breakdown suggestions
    - Multi-language support
    - Uses user's own API keys

    Args:
        request: Chat request with user message and optional conversation history
        current_user: Authenticated Better Auth user
        session: Database session

    Returns:
        Chat response with agent's reply
    """
    try:
        repo = UserDataRepository(session)

        # Get user's API keys (decrypted)
        api_keys = repo.get_api_keys(current_user.id)
        gemini_key = api_keys.get("gemini", "").strip() if api_keys.get("gemini") else ""
        openai_key = api_keys.get("openai", "").strip() if api_keys.get("openai") else ""

        # Validate API keys format
        # Gemini keys start with "AIza", OpenAI keys start with "sk-"
        if gemini_key and not gemini_key.startswith("AIza"):
            logger.warning(f"Invalid Gemini API key format for user {current_user.id}, ignoring")
            gemini_key = ""
        if openai_key and not openai_key.startswith("sk-"):
            logger.warning(f"Invalid OpenAI API key format for user {current_user.id}, ignoring")
            openai_key = ""

        # Check if user can access chat (only user keys, no env fallback)
        if not gemini_key and not openai_key:
            raise HTTPException(
                status_code=403,
                detail="No API key configured. Please add your Gemini or OpenAI API key in Settings to use AI chat."
            )

        # Set up task operations for this request
        task_ops = TaskOperations(session, current_user.id)
        set_task_operations(task_ops)

        try:
            # Get the last user message
            last_message = request.messages[-1] if request.messages else None
            if not last_message:
                raise HTTPException(status_code=400, detail="No message provided")

            user_message = last_message.content

            # Load chat history from database (last 10 messages) to provide context
            db_history = repo.get_chat_history(current_user.id)
            logger.info(f"Loaded {len(db_history)} messages from database for user {current_user.id}")

            # Load database history into agent's session manager
            from src.agents.session_manager import create_user_session, add_user_message, add_assistant_message
            session = await create_user_session(user_id=current_user.id, max_messages=10)
            
            # Load DB history into session (but keep only last 10)
            for msg in db_history[-10:]:  # Only last 10 from DB
                if msg.get("role") == "user":
                    await add_user_message(current_user.id, msg.get("content", ""))
                elif msg.get("role") == "assistant":
                    await add_assistant_message(current_user.id, msg.get("content", ""))

            # Save user message to database (FIFO 10 message limit)
            repo.add_chat_message(
                user_id=current_user.id,
                email=current_user.email,
                role="user",
                content=user_message,
                name=current_user.name if hasattr(current_user, 'name') else None,
            )

            # Use OpenAI Agents SDK based agent with user's API keys
            response_content = await run_agent_with_session(
                user_id=current_user.id,
                message=user_message,
                language=request.language or "english",
                gemini_api_key=gemini_key or None,
                openai_api_key=openai_key or None,
            )

            # Save assistant response to database (FIFO 10 message limit)
            repo.add_chat_message(
                user_id=current_user.id,
                email=current_user.email,
                role="assistant",
                content=response_content,
                name=current_user.name if hasattr(current_user, 'name') else None,
            )

            return ChatResponse(
                content=response_content,
                agent_type="user-api-key"
            )
        finally:
            # Clean up task operations
            clear_task_operations()

    except HTTPException:
        raise
    except ValueError as e:
        # User-friendly error messages from agent
        error_msg = str(e)
        if "quota" in error_msg.lower() or "rate limit" in error_msg.lower() or "429" in error_msg:
            raise HTTPException(
                status_code=429,
                detail="You've exceeded your API usage limit. Please wait a moment and try again, or upgrade your API plan."
            )
        elif "api key" in error_msg.lower() or "invalid" in error_msg.lower():
            raise HTTPException(
                status_code=403,
                detail=str(e)
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=str(e)
            )
    except Exception as e:
        logger.error(f"Unexpected chatbot error: {str(e)}", exc_info=True)
        error_str = str(e).lower()
        
        # Handle specific error types
        if "429" in error_str or "rate limit" in error_str or "quota" in error_str:
            raise HTTPException(
                status_code=429,
                detail="You've exceeded your API usage limit. Please wait a moment and try again."
            )
        elif "401" in error_str or "unauthorized" in error_str:
            raise HTTPException(
                status_code=401,
                detail="Invalid API key. Please check your API key in Settings."
            )
        elif "403" in error_str or "permission" in error_str:
            raise HTTPException(
                status_code=403,
                detail="API key access denied. Please check your API key permissions."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail="An error occurred while processing your request. Please try again."
            )


@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
    limit: int = 10,
) -> ChatHistoryResponse:
    """
    Get chat history for the current user.

    Returns up to 10 messages (FIFO - oldest messages are automatically removed).

    Args:
        current_user: Authenticated Better Auth user
        session: Database session
        limit: Maximum number of messages to return (max 10)

    Returns:
        Chat history with messages
    """
    repo = UserDataRepository(session)
    messages = repo.get_chat_history(current_user.id)

    # Limit to requested amount (max 10 due to FIFO)
    limited_messages = messages[:min(limit, 10)]

    return ChatHistoryResponse(
        messages=limited_messages,
        total=len(limited_messages)
    )


@router.delete("/history", response_model=ClearHistoryResponse)
async def clear_chat_history(
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> ClearHistoryResponse:
    """
    Clear all chat history for the current user.

    Args:
        current_user: Authenticated Better Auth user
        session: Database session

    Returns:
        Number of deleted messages
    """
    repo = UserDataRepository(session)
    count = repo.clear_chat_history(current_user.id)

    return ClearHistoryResponse(
        deleted=count,
        message=f"Cleared {count} messages from chat history"
    )


@router.post("/task")
async def create_task_from_chat(
    description: str,
    current_user: Annotated[BetterAuthUser, Depends(get_current_user)],
    session: Annotated[Session, Depends(get_session)],
) -> Dict[str, Any]:
    """
    Create a task directly from a natural language description.

    Args:
        description: Natural language task description
        current_user: Authenticated Better Auth user
        session: Database session

    Returns:
        Created task details
    """
    try:
        repo = UserDataRepository(session)

        # Get user's API keys
        api_keys = repo.get_api_keys(current_user.id)
        gemini_key = api_keys.get("gemini", "")
        openai_key = api_keys.get("openai", "")

        # Check if user can access chat
        env_gemini = os.getenv("GEMINI_API_KEY")
        env_openai = os.getenv("OPENAI_API_KEY")

        if not gemini_key and not openai_key and not env_gemini and not env_openai:
            raise HTTPException(
                status_code=403,
                detail="No API key configured. Please add your Gemini or OpenAI API key in Settings."
            )

        # Set up task operations
        task_ops = TaskOperations(session, current_user.id)
        set_task_operations(task_ops)

        try:
            from src.agents.task_management_agent import create_task_from_natural_language
            result = await create_task_from_natural_language(description, current_user.id)
            return result
        finally:
            clear_task_operations()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Task creation error: {str(e)}"
        )


@router.get("/health")
async def chat_health() -> Dict[str, Any]:
    """
    Health check for the chat service (no auth required for testing).

    Returns:
        Service status
    """
    return {
        "status": "healthy",
        "message": "Chat service is running",
        "routes_available": [
            "/api/v1/chat",
            "/api/v1/chat/api-key-check",
            "/api/v1/chat/history",
            "/api/v1/chat/health",
        ],
    }
