"""Gemini/OpenAI configuration for task management agent."""
from dotenv import load_dotenv
import os
from openai import AsyncOpenAI
from agents import OpenAIChatCompletionsModel, RunConfig, ModelSettings

load_dotenv()


def get_gemini_config(api_key: str = None) -> RunConfig:
    """Get Gemini/OpenAI run configuration.

    Args:
        api_key: User's API key. If None, falls back to environment variable.

    Returns:
        RunConfig for the agent.

    Raises:
        ValueError: If no API key is available or key is invalid.
    """
    # Use provided key or fall back to environment
    gemini_api_key = api_key or os.getenv("GEMINI_API_KEY")

    if not gemini_api_key:
        raise ValueError("No Gemini API key available. Please configure your API key in settings.")
    
    # Validate that it's a Gemini key (starts with AIza)
    if not gemini_api_key.startswith("AIza"):
        raise ValueError("Invalid Gemini API key format. Gemini keys start with 'AIza'.")

    client = AsyncOpenAI(
        api_key=gemini_api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    model = OpenAIChatCompletionsModel(
        model="gemini-2.5-flash",
        openai_client=client,
    )

    model_setting = ModelSettings(
        temperature=0.7,
        max_tokens=800,
    )

    config = RunConfig(
        model=model,
        model_settings=model_setting,
        model_provider=client
    )

    return config


def get_openai_config(api_key: str = None) -> RunConfig:
    """Get OpenAI run configuration.

    Args:
        api_key: User's OpenAI API key. If None, falls back to environment variable.

    Returns:
        RunConfig for the agent.

    Raises:
        ValueError: If no API key is available or key is invalid.
    """
    # Use provided key or fall back to environment
    openai_api_key = api_key or os.getenv("OPENAI_API_KEY")

    if not openai_api_key:
        raise ValueError("No OpenAI API key available. Please configure your API key in settings.")
    
    # Validate that it's NOT a Gemini key (OpenAI keys start with sk-)
    if openai_api_key.startswith("AIza"):
        raise ValueError("Invalid API key: This appears to be a Gemini API key, not an OpenAI key. Please use your OpenAI API key (starts with 'sk-').")

    client = AsyncOpenAI(
        api_key=openai_api_key,
    )

    model = OpenAIChatCompletionsModel(
        model="gpt-4o-mini",
        openai_client=client,
    )

    model_setting = ModelSettings(
        temperature=0.7,
        max_tokens=800,
    )

    config = RunConfig(
        model=model,
        model_settings=model_setting,
        model_provider=client
    )

    return config
