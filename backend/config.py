class Settings():
    """Application settings."""

    # Application
    app_name: str = "OCR Project"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8080
    # Authorization toggle
    disable_authorization: bool = False

    class Config:
        env_file = ".env"


# Create settings instance
settings = Settings() 