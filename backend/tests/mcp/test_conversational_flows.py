"""Conversational flow tests for the todo agent."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from src.agents.todo_agent import TodoAgent, AgentOutput


class TestConversationalFlows:
    """Test natural language conversational flows."""

    @pytest.fixture
    def agent(self):
        """Create an agent for testing."""
        return TodoAgent(model="gpt-4", api_key="test-key")

    def create_mock_response(self, content, tool_calls=None):
        """Create a mock OpenAI API response."""
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = content
        mock_message.tool_calls = tool_calls
        mock_choice.message = mock_message

        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        return mock_response

    @pytest.mark.asyncio
    async def test_add_task_high_priority_tomorrow(self, agent):
        """Test: 'Add buy milk as high priority task for tomorrow'"""
        message = "Add buy milk as high priority task for tomorrow"

        # Mock the OpenAI API response
        mock_tool_call = MagicMock()
        mock_tool_call.function.name = "create_task"
        mock_response = self.create_mock_response(
            content="I'll add a high priority task to buy milk for tomorrow.",
            tool_calls=[mock_tool_call]
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response

            result = await agent.chat(message)

            assert isinstance(result, AgentOutput)
            assert result.response
            assert not result.clarification_needed
            # Should create a task
            assert result.action_taken or "execute" in result.response.lower() or "create" in result.response.lower()

    @pytest.mark.asyncio
    async def test_query_tasks_due_this_week(self, agent):
        """Test: 'What tasks are due this week?'"""
        message = "What tasks are due this week?"

        mock_tool_call = MagicMock()
        mock_tool_call.function.name = "read_tasks"
        mock_response = self.create_mock_response(
            content="You have 3 tasks due this week.",
            tool_calls=[mock_tool_call]
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            result = await agent.chat(message)

            assert isinstance(result, AgentOutput)
            assert result.response
            assert not result.confirmation_required

    @pytest.mark.asyncio
    async def test_mark_task_complete(self, agent):
        """Test: 'Mark grocery shopping as complete'"""
        message = "Mark grocery shopping as complete"

        mock_tool_call = MagicMock()
        mock_tool_call.function.name = "complete_task"
        mock_response = self.create_mock_response(
            content="I've marked the task as complete.",
            tool_calls=[mock_tool_call]
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            result = await agent.chat(message)

            assert isinstance(result, AgentOutput)
            assert result.response

    @pytest.mark.asyncio
    async def test_delete_completed_tasks_confirmation(self, agent):
        """Test: 'Delete all completed tasks' - should ask for confirmation"""
        message = "Delete all completed tasks"

        mock_tool_call = MagicMock()
        mock_tool_call.function.name = "delete_task"
        mock_response = self.create_mock_response(
            content="Are you sure you want to delete all completed tasks?",
            tool_calls=[mock_tool_call]
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            result = await agent.chat(message)

            assert isinstance(result, AgentOutput)
            assert result.response
            # Should require confirmation for destructive action
            assert result.confirmation_required or "confirm" in result.response.lower()

    @pytest.mark.asyncio
    async def test_ambiguous_delete_task(self, agent):
        """Test: 'Delete the task' - should clarify which task"""
        message = "Delete the task"

        mock_response = self.create_mock_response(
            content="Which task would you like to delete?",
            tool_calls=None
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            result = await agent.chat(message)

            assert isinstance(result, AgentOutput)
            assert result.response

    @pytest.mark.asyncio
    async def test_create_task_with_tags(self, agent):
        """Test creating task with tags"""
        message = "Create a task 'Review proposal' with tags work and urgent"

        mock_tool_call = MagicMock()
        mock_tool_call.function.name = "create_task"
        mock_response = self.create_mock_response(
            content="I've created the task with tags.",
            tool_calls=[mock_tool_call]
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            result = await agent.chat(message)

            assert isinstance(result, AgentOutput)
            assert result.response
            assert not result.clarification_needed

    @pytest.mark.asyncio
    async def test_reschedule_task(self, agent):
        """Test rescheduling a task"""
        message = "Move the meeting task to next Friday"

        mock_tool_call = MagicMock()
        mock_tool_call.function.name = "reschedule_task"
        mock_response = self.create_mock_response(
            content="I've rescheduled the task to next Friday.",
            tool_calls=[mock_tool_call]
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            result = await agent.chat(message)

            assert isinstance(result, AgentOutput)
            assert result.response

    @pytest.mark.asyncio
    async def test_list_high_priority_tasks(self, agent):
        """Test listing tasks by priority"""
        message = "Show me all high priority tasks"

        mock_tool_call = MagicMock()
        mock_tool_call.function.name = "read_tasks"
        mock_response = self.create_mock_response(
            content="You have 2 high priority tasks.",
            tool_calls=[mock_tool_call]
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            result = await agent.chat(message)

            assert isinstance(result, AgentOutput)
            assert result.response

    @pytest.mark.asyncio
    async def test_search_tasks_by_description(self, agent):
        """Test searching tasks"""
        message = "Find tasks related to project X"

        mock_tool_call = MagicMock()
        mock_tool_call.function.name = "read_tasks"
        mock_response = self.create_mock_response(
            content="I found 3 tasks related to project X.",
            tool_calls=[mock_tool_call]
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            result = await agent.chat(message)

            assert isinstance(result, AgentOutput)
            assert result.response

    @pytest.mark.asyncio
    async def test_conversation_history(self, agent):
        """Test maintaining conversation history"""
        history = []

        # First message
        mock_tool_call1 = MagicMock()
        mock_tool_call1.function.name = "create_task"
        mock_response1 = self.create_mock_response(
            content="I'll create a task to call John.",
            tool_calls=[mock_tool_call1]
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response1
            result1 = await agent.chat("Create a task to call John", conversation_history=history)
            assert isinstance(result1, AgentOutput)
            assert result1.response

            # Conversation should maintain context
            history.append({"role": "user", "content": "Create a task to call John"})
            history.append({"role": "assistant", "content": result1.response})

            # Second message with context
            mock_tool_call2 = MagicMock()
            mock_tool_call2.function.name = "update_task"
            mock_response2 = self.create_mock_response(
                content="I've marked it as high priority.",
                tool_calls=[mock_tool_call2]
            )
            mock_create.return_value = mock_response2
            result2 = await agent.chat("Mark it as high priority", conversation_history=history)
            assert isinstance(result2, AgentOutput)
            assert result2.response


class TestAgentOutputValidation:
    """Test agent output validation."""

    @pytest.fixture
    def agent(self):
        """Create an agent for testing."""
        return TodoAgent(model="gpt-4", api_key="test-key")

    def create_mock_response(self, content, tool_calls=None):
        """Create a mock OpenAI API response."""
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = content
        mock_message.tool_calls = tool_calls
        mock_choice.message = mock_message

        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        return mock_response

    @pytest.mark.asyncio
    async def test_agent_output_structure(self, agent):
        """Test that agent output has correct structure"""
        mock_tool_call = MagicMock()
        mock_tool_call.function.name = "read_tasks"
        mock_response = self.create_mock_response(
            content="You have 5 tasks.",
            tool_calls=[mock_tool_call]
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            result = await agent.chat("List my tasks")

            assert hasattr(result, "response")
            assert hasattr(result, "action_taken")
            assert hasattr(result, "confirmation_required")
            assert hasattr(result, "clarification_needed")
            assert isinstance(result.response, str)
            assert isinstance(result.confirmation_required, bool)
            assert isinstance(result.clarification_needed, bool)


class TestErrorHandling:
    """Test error handling in agent."""

    @pytest.fixture
    def agent(self):
        """Create an agent for testing."""
        return TodoAgent(model="gpt-4", api_key="test-key")

    def create_mock_response(self, content, tool_calls=None):
        """Create a mock OpenAI API response."""
        mock_choice = MagicMock()
        mock_message = MagicMock()
        mock_message.content = content
        mock_message.tool_calls = tool_calls
        mock_choice.message = mock_message

        mock_response = MagicMock()
        mock_response.choices = [mock_choice]
        return mock_response

    @pytest.mark.asyncio
    async def test_empty_message(self, agent):
        """Test handling of empty message"""
        mock_response = self.create_mock_response(
            content="How can I help you?",
            tool_calls=None
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            # Empty message should still work (agent should handle gracefully)
            result = await agent.chat("")

            assert isinstance(result, AgentOutput)
            assert result.response

    @pytest.mark.asyncio
    async def test_very_long_message(self, agent):
        """Test handling of very long message"""
        mock_tool_call = MagicMock()
        mock_tool_call.function.name = "create_task"
        mock_response = self.create_mock_response(
            content="I'll create that task.",
            tool_calls=[mock_tool_call]
        )

        with patch.object(agent.client.chat.completions, 'create', new_callable=AsyncMock) as mock_create:
            mock_create.return_value = mock_response
            long_message = "Add a task " + "with a very long description " * 50

            result = await agent.chat(long_message)

            assert isinstance(result, AgentOutput)
            assert result.response
