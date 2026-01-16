"""Add password reset fields to users table

Revision ID: 003
Revises: 002
Create Date: 2025-12-25

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '003'
down_revision: Union[str, None] = '002'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add password reset token and expiration fields to users table."""
    # Add columns to users table
    op.add_column('users', sa.Column('password_reset_token', sa.String(), nullable=True))
    op.add_column('users', sa.Column('password_reset_expires', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Remove password reset fields from users table."""
    # Drop columns
    op.drop_column('users', 'password_reset_expires')
    op.drop_column('users', 'password_reset_token')
