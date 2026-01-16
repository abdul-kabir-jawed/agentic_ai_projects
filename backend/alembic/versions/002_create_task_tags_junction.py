"""Create task_tags junction table for normalized tag storage (optional enhancement)

Revision ID: 002
Revises: 001
Create Date: 2025-12-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create normalized tag storage tables (optional enhancement).

    This migration creates:
    1. tags table - stores unique tag names
    2. task_tags table - junction table for many-to-many relationship

    Note: This is an optional enhancement. The current implementation
    stores tags as a comma-separated string in the tasks.tags column.
    """
    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name', 'user_id', name='uq_tags_name_user')
    )

    # Create index on user_id for tags
    op.create_index('ix_tags_user_id', 'tags', ['user_id'])
    op.create_index('ix_tags_name', 'tags', ['name'])

    # Create junction table for task-tag relationship
    op.create_table(
        'task_tags',
        sa.Column('task_id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('task_id', 'tag_id')
    )

    # Create indexes for efficient lookups
    op.create_index('ix_task_tags_task_id', 'task_tags', ['task_id'])
    op.create_index('ix_task_tags_tag_id', 'task_tags', ['tag_id'])


def downgrade() -> None:
    """Drop task_tags junction table and tags table."""
    # Drop indexes
    op.drop_index('ix_task_tags_tag_id', table_name='task_tags')
    op.drop_index('ix_task_tags_task_id', table_name='task_tags')

    # Drop junction table
    op.drop_table('task_tags')

    # Drop indexes on tags
    op.drop_index('ix_tags_name', table_name='tags')
    op.drop_index('ix_tags_user_id', table_name='tags')

    # Drop tags table
    op.drop_table('tags')
