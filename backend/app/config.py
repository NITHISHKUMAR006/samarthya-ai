import os
from pathlib import Path
from dotenv import load_dotenv

# Search for config.env in backend/ and root directories
base_dir = Path(__file__).resolve().parent.parent
root_dir = base_dir.parent

for candidate in [
    base_dir / "config.env",
    root_dir / "config.env",
    Path.cwd() / "config.env",
]:
    if candidate.is_file():
        load_dotenv(dotenv_path=candidate, override=False)
        break


def _build_database_url() -> str:
    """Builds database connection URL from Direct URI or falls back to SQLite."""
    explicit_url = os.getenv("DATABASE_URL", "").strip()
    if explicit_url:
        # If placeholder is still present, fall back to SQLite until configured
        if "YOUR-PASSWORD" in explicit_url.upper() or "YOUR-PROJECT-REF" in explicit_url.upper():
            return "sqlite:///./samarthya.db"
        if explicit_url.startswith("postgres://"):
            explicit_url = explicit_url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif explicit_url.startswith("postgresql://") and not explicit_url.startswith("postgresql+"):
            explicit_url = explicit_url.replace("postgresql://", "postgresql+psycopg2://", 1)

        # Safely URL-encode the password if it contains unescaped special characters (e.g. '@')
        try:
            if "://" in explicit_url and "@" in explicit_url:
                scheme, rest = explicit_url.split("://", 1)
                creds, host_part = rest.rsplit("@", 1)
                if ":" in creds:
                    user, pwd = creds.split(":", 1)
                    from urllib.parse import quote_plus, unquote_plus
                    encoded_pwd = quote_plus(unquote_plus(pwd))
                    explicit_url = f"{scheme}://{user}:{encoded_pwd}@{host_part}"
        except Exception:
            pass

        return explicit_url

    return "sqlite:///./samarthya.db"


class Settings:
    PROJECT_NAME: str = "SAMARTHYA AI"
    PROJECT_DESCRIPTION: str = "AI-Powered Personalized Learning Platform for Government Officials"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Database URL (Supabase PostgreSQL Direct URI)
    DATABASE_URL: str = _build_database_url()

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "samarthya-secret-key-change-in-production-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

    # File uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")

    # AI / LLM (OpenAI & Compatible Providers)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", os.getenv("LLM_API_KEY", "")).strip()
    OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").strip()
    OPENAI_MODEL_ID: str = os.getenv("OPENAI_MODEL_ID", os.getenv("LLM_MODEL", "gpt-4o-mini")).strip()
    LLM_API_KEY: str = OPENAI_API_KEY
    LLM_MODEL: str = OPENAI_MODEL_ID

    # CORS
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:8005,http://localhost:3000"
    ).split(",")


settings = Settings()
