"""add auth fields to users

Revision ID: 8b2ce6a6f2f5
Revises: 16652a9e92db
Create Date: 2026-04-02 16:05:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "8b2ce6a6f2f5"
down_revision = "16652a9e92db"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column(
                "password_hash",
                sa.String(length=255),
                nullable=False,
                server_default="!",
            )
        )
        batch_op.add_column(
            sa.Column(
                "role",
                sa.String(length=50),
                nullable=False,
                server_default="member",
            )
        )
        batch_op.create_index(batch_op.f("ix_users_role"), ["role"], unique=False)


def downgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_users_role"))
        batch_op.drop_column("role")
        batch_op.drop_column("password_hash")
