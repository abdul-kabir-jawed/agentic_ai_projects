"""
Event Streaming Service for Evolution of Todo - Phase V
Handles Kafka-based event publishing and consumption for distributed architecture
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Callable, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import os

# Kafka imports with fallback for local development
try:
    from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
    from aiokafka.errors import KafkaError
    KAFKA_AVAILABLE = True
except ImportError:
    KAFKA_AVAILABLE = False
    logging.warning("aiokafka not installed - event streaming will be disabled")

logger = logging.getLogger(__name__)


class EventType(str, Enum):
    """Event types for the todo application"""
    # Todo events
    TODO_CREATED = "todo.created"
    TODO_UPDATED = "todo.updated"
    TODO_DELETED = "todo.deleted"
    TODO_COMPLETED = "todo.completed"
    TODO_UNCOMPLETED = "todo.uncompleted"

    # User events
    USER_REGISTERED = "user.registered"
    USER_LOGGED_IN = "user.logged_in"
    USER_LOGGED_OUT = "user.logged_out"
    USER_PASSWORD_RESET = "user.password_reset"
    USER_EMAIL_VERIFIED = "user.email_verified"

    # AI events
    AI_CHAT_MESSAGE = "ai.chat_message"
    AI_SUGGESTION_GENERATED = "ai.suggestion_generated"

    # System events
    SYSTEM_HEALTH_CHECK = "system.health_check"
    SYSTEM_ERROR = "system.error"


@dataclass
class Event:
    """Base event structure"""
    event_type: str
    timestamp: str
    source: str
    data: dict
    user_id: Optional[str] = None
    correlation_id: Optional[str] = None

    def to_dict(self) -> dict:
        return asdict(self)

    def to_json(self) -> str:
        return json.dumps(self.to_dict())

    @classmethod
    def from_json(cls, json_str: str) -> "Event":
        data = json.loads(json_str)
        return cls(**data)


class EventProducer:
    """Kafka event producer for publishing events"""

    def __init__(self):
        self.producer: Optional[AIOKafkaProducer] = None
        self.bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        self.enabled = os.getenv("KAFKA_ENABLED", "false").lower() == "true"

    async def start(self):
        """Initialize and start the Kafka producer"""
        if not self.enabled:
            logger.info("Kafka event streaming is disabled")
            return

        if not KAFKA_AVAILABLE:
            logger.warning("aiokafka not installed - skipping producer initialization")
            return

        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: v.encode('utf-8'),
                key_serializer=lambda k: k.encode('utf-8') if k else None,
                acks='all',
                retries=3,
                retry_backoff_ms=1000,
            )
            await self.producer.start()
            logger.info(f"Kafka producer started, connected to {self.bootstrap_servers}")
        except Exception as e:
            logger.error(f"Failed to start Kafka producer: {e}")
            self.producer = None

    async def stop(self):
        """Stop the Kafka producer"""
        if self.producer:
            await self.producer.stop()
            logger.info("Kafka producer stopped")

    async def publish(
        self,
        event_type: EventType,
        data: dict,
        user_id: Optional[str] = None,
        correlation_id: Optional[str] = None,
        topic: Optional[str] = None
    ) -> bool:
        """
        Publish an event to Kafka

        Args:
            event_type: The type of event
            data: Event payload data
            user_id: Optional user ID associated with the event
            correlation_id: Optional correlation ID for tracing
            topic: Optional topic override (defaults to event type prefix)
        """
        event = Event(
            event_type=event_type.value,
            timestamp=datetime.utcnow().isoformat(),
            source="evolution-todo-backend",
            data=data,
            user_id=user_id,
            correlation_id=correlation_id
        )

        # Log event for debugging
        logger.debug(f"Publishing event: {event.event_type}")

        # If Kafka is not enabled or available, just log and return
        if not self.enabled or not self.producer:
            logger.info(f"[Event Stream] {event.event_type}: {json.dumps(data)[:200]}")
            return True

        try:
            # Determine topic from event type
            if not topic:
                topic = event_type.value.split('.')[0] + "-events"  # e.g., "todo-events"

            # Use user_id as key for partitioning if available
            key = user_id if user_id else None

            await self.producer.send_and_wait(
                topic,
                value=event.to_json(),
                key=key
            )
            logger.info(f"Event published: {event_type.value} to {topic}")
            return True

        except Exception as e:
            logger.error(f"Failed to publish event {event_type.value}: {e}")
            return False


class EventConsumer:
    """Kafka event consumer for processing events"""

    def __init__(self, group_id: str = "evolution-todo-consumer"):
        self.consumer: Optional[AIOKafkaConsumer] = None
        self.bootstrap_servers = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
        self.group_id = group_id
        self.enabled = os.getenv("KAFKA_ENABLED", "false").lower() == "true"
        self.handlers: dict[str, list[Callable]] = {}
        self._running = False

    def register_handler(self, event_type: EventType, handler: Callable):
        """Register a handler for a specific event type"""
        if event_type.value not in self.handlers:
            self.handlers[event_type.value] = []
        self.handlers[event_type.value].append(handler)
        logger.info(f"Registered handler for {event_type.value}")

    async def start(self, topics: list[str]):
        """Initialize and start the Kafka consumer"""
        if not self.enabled:
            logger.info("Kafka event streaming is disabled")
            return

        if not KAFKA_AVAILABLE:
            logger.warning("aiokafka not installed - skipping consumer initialization")
            return

        try:
            self.consumer = AIOKafkaConsumer(
                *topics,
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                value_deserializer=lambda v: v.decode('utf-8'),
                auto_offset_reset='earliest',
                enable_auto_commit=True,
            )
            await self.consumer.start()
            self._running = True
            logger.info(f"Kafka consumer started, subscribed to {topics}")

            # Start consuming in background
            asyncio.create_task(self._consume())

        except Exception as e:
            logger.error(f"Failed to start Kafka consumer: {e}")
            self.consumer = None

    async def stop(self):
        """Stop the Kafka consumer"""
        self._running = False
        if self.consumer:
            await self.consumer.stop()
            logger.info("Kafka consumer stopped")

    async def _consume(self):
        """Main consume loop"""
        if not self.consumer:
            return

        try:
            async for message in self.consumer:
                if not self._running:
                    break

                try:
                    event = Event.from_json(message.value)
                    await self._process_event(event)
                except Exception as e:
                    logger.error(f"Error processing message: {e}")

        except Exception as e:
            logger.error(f"Consumer loop error: {e}")

    async def _process_event(self, event: Event):
        """Process a received event"""
        handlers = self.handlers.get(event.event_type, [])

        if not handlers:
            logger.debug(f"No handlers for event type: {event.event_type}")
            return

        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(event)
                else:
                    handler(event)
            except Exception as e:
                logger.error(f"Handler error for {event.event_type}: {e}")


# Singleton instances
_producer: Optional[EventProducer] = None
_consumer: Optional[EventConsumer] = None


async def get_producer() -> EventProducer:
    """Get or create the singleton event producer"""
    global _producer
    if _producer is None:
        _producer = EventProducer()
        await _producer.start()
    return _producer


async def get_consumer() -> EventConsumer:
    """Get or create the singleton event consumer"""
    global _consumer
    if _consumer is None:
        _consumer = EventConsumer()
    return _consumer


async def shutdown_event_services():
    """Shutdown all event services"""
    global _producer, _consumer
    if _producer:
        await _producer.stop()
        _producer = None
    if _consumer:
        await _consumer.stop()
        _consumer = None


# Convenience functions for common events
async def publish_todo_created(todo_id: str, title: str, user_id: str):
    """Publish a todo created event"""
    producer = await get_producer()
    await producer.publish(
        EventType.TODO_CREATED,
        {"todo_id": todo_id, "title": title},
        user_id=user_id
    )


async def publish_todo_completed(todo_id: str, title: str, user_id: str):
    """Publish a todo completed event"""
    producer = await get_producer()
    await producer.publish(
        EventType.TODO_COMPLETED,
        {"todo_id": todo_id, "title": title},
        user_id=user_id
    )


async def publish_todo_deleted(todo_id: str, user_id: str):
    """Publish a todo deleted event"""
    producer = await get_producer()
    await producer.publish(
        EventType.TODO_DELETED,
        {"todo_id": todo_id},
        user_id=user_id
    )


async def publish_user_registered(user_id: str, email: str):
    """Publish a user registered event"""
    producer = await get_producer()
    await producer.publish(
        EventType.USER_REGISTERED,
        {"email": email},
        user_id=user_id
    )


async def publish_ai_chat(user_id: str, message: str, response: str):
    """Publish an AI chat event"""
    producer = await get_producer()
    await producer.publish(
        EventType.AI_CHAT_MESSAGE,
        {"message_preview": message[:100], "response_preview": response[:100]},
        user_id=user_id
    )
