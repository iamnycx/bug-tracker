"""add user blocking and credentials fields

Revision ID: f1b3d9a4c6e7
Revises: 8b2ce6a6f2f5
Create Date: 2026-04-03 03:10:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "f1b3d9a4c6e7"
down_revision = "8b2ce6a6f2f5"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("credential_password", sa.String(length=255), nullable=True))
        batch_op.add_column(
            sa.Column(
                "is_blocked",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            )
        )
        batch_op.create_index(batch_op.f("ix_users_is_blocked"), ["is_blocked"], unique=False)


def downgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_index(batch_op.f("ix_users_is_blocked"))
        batch_op.drop_column("is_blocked")
        batch_op.drop_column("credential_password")
