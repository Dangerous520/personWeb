import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB配置
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "portfolio_db")

    # API配置
    API_KEY: str = os.getenv("API_KEY", "your-secret-api-key")

    # 管理员配置
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "deng301096")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "deng301096_secret_key")

    # CORS配置
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",  # 开发环境
        "http://localhost:8000",  # 本地API服务
        "http://127.0.0.1:3000",  # 开发环境备用
        "https://your-portfolio-domain.com",  # 生产环境
        "*"  # 允许所有来源 (开发阶段使用，生产环境应移除)
    ]

    # 速率限制配置
    RATE_LIMIT_PER_MINUTE: int = 60


settings = Settings()

# 导出设置变量
MONGODB_URI = settings.MONGODB_URI
DB_NAME = settings.DB_NAME
API_KEY = settings.API_KEY
ALLOWED_ORIGINS = settings.ALLOWED_ORIGINS
RATE_LIMIT_PER_MINUTE = settings.RATE_LIMIT_PER_MINUTE
ADMIN_PASSWORD = settings.ADMIN_PASSWORD
JWT_SECRET = settings.JWT_SECRET

# 打印调试信息
print(f"配置加载完成: ADMIN_PASSWORD={ADMIN_PASSWORD}")