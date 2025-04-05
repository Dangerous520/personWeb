from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional


class ContactModel(BaseModel):
    """联系表单提交模型"""
    name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    message: str = Field(..., min_length=1, max_length=1000)


class ContactInDB(ContactModel):
    """数据库中的联系表单模型"""
    id: str
    created_at: datetime
    ip_address: Optional[str] = None