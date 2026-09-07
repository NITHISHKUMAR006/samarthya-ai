import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    PROJECT_NAME: str = "SAMARTHYA AI"
    PROJECT_DESCRIPTION: str = "AI-Powered Personalized Learning Platform for Government Officials"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://samarthya_user:samarthya_pass@localhost:3306/samarthya_db",
    )

    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "samarthya-secret-key-change-in-production-2026")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

    # File uploads
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")

    # AI / LLM
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "")

    # CORS
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
    ).split(",")


settings = Settings()
