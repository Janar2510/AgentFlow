"""
Database configuration and session management for AgentFlow.

Provides async SQLAlchemy setup with PostgreSQL, connection pooling,
and session management for optimal performance.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import MetaData
from sqlalchemy.pool import NullPool
import structlog

from .config import settings, DATABASE_CONFIG

logger = structlog.get_logger(__name__)

# Create async engine with optimized settings
engine = create_async_engine(
    DATABASE_CONFIG["url"],
    echo=DATABASE_CONFIG["echo"],
    pool_size=DATABASE_CONFIG["pool_size"],
    max_overflow=DATABASE_CONFIG["max_overflow"],
    pool_pre_ping=DATABASE_CONFIG["pool_pre_ping"],
    pool_recycle=DATABASE_CONFIG["pool_recycle"],
    poolclass=NullPool if "sqlite" in DATABASE_CONFIG["url"] else None,
)

# Create session factory
async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Create declarative base with consistent naming convention
metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s"
    }
)

Base = declarative_base(metadata=metadata)

# Dependency for FastAPI
async def get_db() -> AsyncSession:
    """
    Dependency function to get database session.
    
    Yields:
        AsyncSession: Database session
    """
    async with async_session_factory() as session:
        try:
            yield session
        except Exception as e:
            logger.error("Database session error", exc_info=e)
            await session.rollback()
            raise
        finally:
            await session.close()

# Database initialization
async def create_tables():
    """Create all database tables"""
    async with engine.begin() as conn:
        # Import all models to ensure they're registered
        from app.models import workflow, user, agent, execution  # noqa: F401
        
        logger.info("Creating database tables...")
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully")

async def drop_tables():
    """Drop all database tables (for testing)"""
    async with engine.begin() as conn:
        logger.warning("Dropping all database tables...")
        await conn.run_sync(Base.metadata.drop_all)
        logger.warning("Database tables dropped")

# Health check function
async def check_database_health() -> bool:
    """
    Check database connectivity.
    
    Returns:
        bool: True if database is healthy, False otherwise
    """
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception as e:
        logger.error("Database health check failed", exc_info=e)
        return False