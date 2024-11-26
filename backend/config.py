from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
class BaseConfig(BaseSettings):
    MONGODB_HOST: Optional[str]
    DB_NAME: Optional[str]
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")