"""Chatbot API router for natural language todo management."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os

from src.agents.todo_agent import run_chat

router = APIRouter(tags=["chatbot"])


class ChatMessage(BaseModel):
    """Chat message structure."""
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    """Chat request from client."""
    messages: List[ChatMessage]


class ChatResponse(BaseModel):
    """Chat response to client."""
    content: str


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a natural language chat message using the todo agent.

    Args:
        request: Chat request with user message and optional conversation history

    Returns:
        Chat response with agent's reply and conversation history
    """
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="OPENAI_API_KEY environment variable not set"
            )

        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        # Get agent response
        response_content = await run_chat(messages)

        return ChatResponse(content=response_content)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chatbot error: {str(e)}"
        )