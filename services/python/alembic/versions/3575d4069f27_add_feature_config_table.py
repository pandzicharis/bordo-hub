"""add_feature_config_table

Revision ID: d1d55d8a27b1
Revises: 958d6c2d9046
Create Date: 2025-06-03 11:20:31.791303

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1d55d8a27b1'
down_revision: Union[str, None] = '958d6c2d9046'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: create feature config table."""
    op.create_table(
        'feature_configs',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(), nullable=True)
    )


def downgrade() -> None:
    """Downgrade schema: drop feature_configs table."""
    op.drop_table('feature_configs')
