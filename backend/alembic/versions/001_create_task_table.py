"""Create task table with Phase II attributes

Revision ID: 001
Revises:
Create Date: 2025-12-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create tasks table with all Phase II attributes and indexes."""
    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=False),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('priority', sa.String(), nullable=False, server_default='medium'),
        sa.Column('tags', sa.String(), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('is_daily', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for frequently queried columns
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('ix_tasks_is_completed', 'tasks', ['is_completed'])
    op.create_index('ix_tasks_priority', 'tasks', ['priority'])
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'])
    op.create_index('ix_tasks_is_daily', 'tasks', ['is_daily'])
    op.create_index('ix_tasks_created_at', 'tasks', ['created_at'])

    # Create composite index for common query patterns
    op.create_index('ix_tasks_user_completed', 'tasks', ['user_id', 'is_completed'])
    op.create_index('ix_tasks_user_priority', 'tasks', ['user_id', 'priority'])
    op.create_index('ix_tasks_user_daily', 'tasks', ['user_id', 'is_daily'])


def downgrade() -> None:
    """Drop tasks table and all indexes."""
    # Drop indexes
    op.drop_index('ix_tasks_user_daily', table_name='tasks')
    op.drop_index('ix_tasks_user_priority', table_name='tasks')
    op.drop_index('ix_tasks_user_completed', table_name='tasks')
    op.drop_index('ix_tasks_created_at', table_name='tasks')
    op.drop_index('ix_tasks_is_daily', table_name='tasks')
    op.drop_index('ix_tasks_due_date', table_name='tasks')
    op.drop_index('ix_tasks_priority', table_name='tasks')
    op.drop_index('ix_tasks_is_completed', table_name='tasks')
    op.drop_index('ix_tasks_user_id', table_name='tasks')

    # Drop table
    op.drop_table('tasks')
