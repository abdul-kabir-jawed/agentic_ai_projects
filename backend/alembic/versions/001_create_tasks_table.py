"""Create tasks table with all Phase II attributes

Revision ID: 001_create_tasks_table
Revises: 
Create Date: 2025-12-23 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_create_tasks_table'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=False),
        sa.Column('is_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('priority', sa.String(), nullable=False, server_default='medium'),
        sa.Column('tags', sa.String(), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('is_daily', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for query performance
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('ix_tasks_is_completed', 'tasks', ['is_completed'])
    op.create_index('ix_tasks_priority', 'tasks', ['priority'])
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'])
    op.create_index('ix_tasks_created_at', 'tasks', ['created_at'])
    op.create_index('ix_tasks_is_daily', 'tasks', ['is_daily'])


def downgrade() -> None:
    op.drop_index('ix_tasks_is_daily', table_name='tasks')
    op.drop_index('ix_tasks_created_at', table_name='tasks')
    op.drop_index('ix_tasks_due_date', table_name='tasks')
    op.drop_index('ix_tasks_priority', table_name='tasks')
    op.drop_index('ix_tasks_is_completed', table_name='tasks')
    op.drop_index('ix_tasks_user_id', table_name='tasks')
    op.drop_table('tasks')
