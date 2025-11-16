from fastapi_mail import ConnectionConfig
from pydantic_settings import BaseSettings 
from pydantic import EmailStr, ConfigDict

class EmailSettings(BaseSettings):
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: EmailStr = "noreply@example.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"  # Default Gmail, override bằng .env
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    model_config = ConfigDict(
        env_file=".env",
        extra="ignore"  # Ignore các biến không định nghĩa trong .env
    )

email_settings = EmailSettings()

mail_conf = ConnectionConfig(
    MAIL_USERNAME=email_settings.MAIL_USERNAME,
    MAIL_PASSWORD=email_settings.MAIL_PASSWORD,
    MAIL_FROM=email_settings.MAIL_FROM,
    MAIL_PORT=email_settings.MAIL_PORT,
    MAIL_SERVER=email_settings.MAIL_SERVER,
    MAIL_STARTTLS=email_settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=email_settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
)
