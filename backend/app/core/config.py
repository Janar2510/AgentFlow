"""
Configuration settings for AgentFlow backend application.

Uses Pydantic Settings for type-safe configuration management
with support for environment variables and .env files.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # API Configuration
    API_SECRET_KEY: str = Field(..., description="Secret key for JWT tokens")
    API_HOST: str = Field(default="0.0.0.0", description="API host")
    API_PORT: int = Field(default=8000, description="API port")
    API_DEBUG: bool = Field(default=False, description="Enable debug mode")
    
    # Database Configuration
    DATABASE_URL: str = Field(..., description="PostgreSQL database URL")
    
    # Redis Configuration
    REDIS_URL: str = Field(..., description="Redis connection URL")
    
    # JWT Configuration
    JWT_SECRET_KEY: str = Field(..., description="JWT secret key")
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="JWT token expiration")
    
    # AI Provider Configuration
    OPENAI_API_KEY: Optional[str] = Field(default=None, description="OpenAI API key")
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, description="Anthropic API key")
    AZURE_OPENAI_ENDPOINT: Optional[str] = Field(default=None, description="Azure OpenAI endpoint")
    AZURE_OPENAI_API_KEY: Optional[str] = Field(default=None, description="Azure OpenAI API key")
    
    # File Storage Configuration
    STORAGE_TYPE: str = Field(default="local", description="Storage type: local, s3, gcs")
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, description="AWS access key ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, description="AWS secret access key")
    AWS_S3_BUCKET: Optional[str] = Field(default=None, description="S3 bucket name")
    AWS_REGION: str = Field(default="us-east-1", description="AWS region")
    
    # Monitoring & Logging
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    SENTRY_DSN: Optional[str] = Field(default=None, description="Sentry DSN for error tracking")
    PROMETHEUS_ENABLED: bool = Field(default=True, description="Enable Prometheus metrics")
    
    # Email Configuration
    EMAIL_SMTP_HOST: Optional[str] = Field(default=None, description="SMTP host")
    EMAIL_SMTP_PORT: int = Field(default=587, description="SMTP port")
    EMAIL_SMTP_USER: Optional[str] = Field(default=None, description="SMTP username")
    EMAIL_SMTP_PASSWORD: Optional[str] = Field(default=None, description="SMTP password")
    EMAIL_FROM: str = Field(default="AgentFlow <noreply@agentflow.dev>", description="From email address")
    
    # Feature Flags
    FEATURE_MARKETPLACE_ENABLED: bool = Field(default=True, description="Enable agent marketplace")
    FEATURE_COLLABORATIVE_EDITING: bool = Field(default=True, description="Enable collaborative editing")
    FEATURE_ADVANCED_ANALYTICS: bool = Field(default=False, description="Enable advanced analytics")
    
    # Rate Limiting
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = Field(default=60, description="Rate limit per minute")
    RATE_LIMIT_BURST_SIZE: int = Field(default=10, description="Rate limit burst size")
    
    # Development Settings
    DEV_AUTO_RELOAD: bool = Field(default=True, description="Enable auto-reload in development")
    DEV_CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        description="CORS origins for development"
    )
    
    # Kubernetes Configuration
    K8S_NAMESPACE: str = Field(default="agentflow", description="Kubernetes namespace")
    K8S_IMAGE_REGISTRY: str = Field(default="registry.agentflow.dev", description="Container registry")
    K8S_CLUSTER_NAME: str = Field(default="agentflow-cluster", description="Kubernetes cluster name")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Create global settings instance
settings = Settings()

# Derived configuration
DATABASE_CONFIG = {
    "url": settings.DATABASE_URL,
    "echo": settings.API_DEBUG,
    "pool_size": 10,
    "max_overflow": 20,
    "pool_pre_ping": True,
    "pool_recycle": 3600,
}

REDIS_CONFIG = {
    "url": settings.REDIS_URL,
    "decode_responses": True,
    "socket_keepalive": True,
    "socket_keepalive_options": {},
    "retry_on_timeout": True,
}

CORS_CONFIG = {
    "allow_origins": settings.DEV_CORS_ORIGINS if settings.API_DEBUG else ["https://agentflow.dev"],
    "allow_credentials": True,
    "allow_methods": ["*"],
    "allow_headers": ["*"],
}

# Logging configuration
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
        "structured": {
            "()": "structlog.stdlib.ProcessorFormatter",
            "processor": "structlog.dev.ConsoleRenderer" if settings.API_DEBUG else "structlog.processors.JSONRenderer",
        },
    },
    "handlers": {
        "default": {
            "formatter": "structured",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "root": {
        "level": settings.LOG_LEVEL,
        "handlers": ["default"],
    },
}