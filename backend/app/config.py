"""
Application configuration.

Supports two modes:
1. Local dev  — DATABASE_URL and JWT_SECRET env vars directly
2. Production — DB_SECRET_JSON env var (from Secrets Manager) that
   contains username/password/dbname, plus DB_HOST/DB_PORT env vars

The `database_url` property computes the right URL for either mode.
"""

import json
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)

    # ─── Local dev / direct URL ───
    database_url: Optional[str] = None

    # ─── Production (Secrets Manager) ───
    # ECS injects this as a JSON string from Secrets Manager
    db_secret_json: Optional[str] = None
    db_host: Optional[str] = None
    db_port: int = 5432

    # ─── JWT ───
    jwt_secret: str = "dev-secret-change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    # ─── App ───
    app_name: str = "Job Tracker API"
    environment: str = "development"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def effective_database_url(self) -> str:
        """Compute the DB URL from whichever inputs are available."""
        # Priority 1: explicit DATABASE_URL (used by docker-compose locally)
        if self.database_url:
            return self.database_url

        # Priority 2: DB_SECRET_JSON + DB_HOST + DB_PORT (ECS production)
        if self.db_secret_json:
            secret = json.loads(self.db_secret_json)
            user = secret["username"]
            password = secret["password"]
            dbname = secret["dbname"]
            host = self.db_host
            port = self.db_port
            return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{dbname}"

        raise RuntimeError(
            "No database configuration found. Set DATABASE_URL (local) "
            "or DB_SECRET_JSON + DB_HOST (production)."
        )


settings = Settings()
