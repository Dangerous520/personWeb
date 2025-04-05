from fastapi import APIRouter, HTTPException, Depends, Path
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Union
from datetime import datetime
from config.settings import MONGODB_URI, DB_NAME
from motor.motor_asyncio import AsyncIOMotorClient
from utils.response import success_response
from bson import ObjectId
import sys
from api.admin import verify_token

router = APIRouter()

# 创建MongoDB客户端
client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]
collection = db["contacts"]

# 定义联系表单模型
class ContactForm(BaseModel):
    name: str
    email: EmailStr
    message: str

@router.post("/", tags=["contact"])
async def submit_contact_form(contact: ContactForm):
    """
    提交联系表单
    
    参数:
        - contact: 联系表单数据
    
    返回:
        - 保存的联系信息
    """
    try:
        # 准备要保存的数据
        contact_data = contact.dict()
        contact_data["status"] = "new"  # 新建状态
        contact_data["createdAt"] = datetime.utcnow()
        contact_data["updatedAt"] = datetime.utcnow()
        
        # 保存到数据库
        result = await collection.insert_one(contact_data)
        
        # 获取保存的数据
        saved_contact = await collection.find_one({"_id": result.inserted_id})
        
        # 转换_id为字符串id
        if saved_contact:
            saved_contact["id"] = str(saved_contact["_id"])
            del saved_contact["_id"]
        
        return success_response(message="提交成功", data=saved_contact)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"提交联系表单失败: {str(e)}")

@router.get("/", tags=["contact"])
async def get_contact_messages():
    """
    获取所有联系消息 (仅管理员使用)
    
    返回:
        - 联系信息列表
    """
    try:
        # 这里应该添加身份验证逻辑
        
        cursor = collection.find().sort("createdAt", -1)
        contacts = []
        
        async for contact in cursor:
            contact["id"] = str(contact["_id"])
            del contact["_id"]
            contacts.append(contact)
        
        return success_response(data=contacts)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取联系信息失败: {str(e)}")

@router.delete("/{message_id}", tags=["contact"], dependencies=[Depends(verify_token)])
async def delete_contact_message(message_id: str = Path(...)):
    """
    删除联系消息
    
    参数:
        - message_id: 消息ID
    
    返回:
        - 删除结果
    """
    try:
        # 验证ID格式
        if not ObjectId.is_valid(message_id):
            raise HTTPException(
                status_code=400, 
                detail=f"无效的消息ID格式: {message_id}"
            )
        
        # 删除消息
        result = await collection.delete_one({"_id": ObjectId(message_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=404,
                detail=f"未找到ID为 {message_id} 的消息"
            )
        
        return success_response(message=f"成功删除ID为 {message_id} 的消息")
    except HTTPException:
        # 重新抛出 HTTPException
        raise
    except Exception as e:
        error_message = f"删除消息失败: {str(e)}"
        print(error_message, file=sys.stderr)
        raise HTTPException(status_code=500, detail=error_message)