"""add custom event fields to itinerary_items

Revision ID: a1b2c3d4e5f6
Revises: 341ea613edc3
Create Date: 2026-05-04

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '49c8af8cb82f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column('itinerary_items', 'event_id', nullable=True)
    op.add_column('itinerary_items', sa.Column('custom_title', sa.String(), nullable=True))
    op.add_column('itinerary_items', sa.Column('custom_location', sa.String(), nullable=True))
    op.add_column('itinerary_items', sa.Column('custom_start_time', sa.DateTime(), nullable=True))
    op.add_column('itinerary_items', sa.Column('custom_end_time', sa.DateTime(), nullable=True))
    op.add_column('itinerary_items', sa.Column('custom_notes', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('itinerary_items', 'custom_notes')
    op.drop_column('itinerary_items', 'custom_end_time')
    op.drop_column('itinerary_items', 'custom_start_time')
    op.drop_column('itinerary_items', 'custom_location')
    op.drop_column('itinerary_items', 'custom_title')
    op.alter_column('itinerary_items', 'event_id', nullable=False)
