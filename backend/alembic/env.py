# === Alembic Environment Configuration ===
# This script is the entry point for database migrations.
# It connects Alembic to your FastAPI models and the database.
#
# Key features:
#   1. Loads the database URL from settings.database_url.
#   2. Imports all models so Alembic can auto-generate migrations by
#      comparing the models to the current database state.
#   3. Handles both 'offline' (SQL generation) and 'online' (direct DB update) migrations.

from __future__ import annotations

from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

from app.core.config import settings
from app.db.base import Base
from app.models import student, user  # Import models here so Alembic "sees" them

# This is the Alembic Config object, which provides access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the sqlalchemy.url dynamically from our app settings (no need to hardcode it in alembic.ini)
config.set_main_option("sqlalchemy.url", settings.database_url)

# This is used for 'autogenerate' support — tells Alembic where our metadata (tables) is.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata, compare_type=True
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
