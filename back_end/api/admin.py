import logging
import os
from fastapi import APIRouter, HTTPException, Header, Body, Depends, Path
from typing import Dict, List, Optional
import jwt
from datetime import datetime, timedelta

from config.settings import settings
from motor.motor_asyncio import AsyncIOMotorClient
from utils.response import success_response, error_response

router = APIRouter()
logger = logging.getLogger(__name__)

"""
管理员相关的API
"""

# 创建MongoDB客户端
client = AsyncIOMotorClient(settings.MONGODB_URI)
db = client[settings.DB_NAME]
contacts_collection = db["contacts"]

# 生成签名密钥
SECRET_KEY = os.environ.get("JWT_SECRET", "deng301096_secret_key")
TOKEN_EXPIRE_MINUTES = 60 * 24  # 24小时

async def verify_token(authorization: str = Header(...)):
    """
    验证JWT令牌
    
    参数:
        - authorization: 请求头中的Authorization字段
        
    返回:
        - 如果令牌有效，返回解码后的令牌负载
    """
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="令牌已过期")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="无效的令牌")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"验证失败: {str(e)}")

@router.get("/test-password/{test_password}")
async def test_password(test_password: str = Path(...)):
    """测试密码是否匹配配置的管理员密码"""
    admin_password = settings.ADMIN_PASSWORD
    logger.info(f"测试密码匹配: 输入={test_password}, 配置密码={admin_password}")
    
    # 简单的匹配测试
    is_match = test_password == admin_password
    
    return success_response({
        "test_password": test_password,
        "admin_password": admin_password,
        "is_match": is_match,
        "test_password_length": len(test_password),
        "admin_password_length": len(admin_password)
    })

@router.post("/login")
async def login(login_info: Dict[str, str] = Body(...)):
    """
    管理员登录
    
    参数:
        - login_info: 包含username和password的字典
    
    返回:
        - token: JWT token
    """
    try:
        username = login_info.get("username")
        password = login_info.get("password")
        
        # 验证用户名和密码 (简单实现)
        logger.info(f"尝试登录: username={username}")
        logger.info(f"输入密码长度: {len(password) if password else 'None'}")
        logger.info(f"配置密码长度: {len(settings.ADMIN_PASSWORD)}")
        
        if password != settings.ADMIN_PASSWORD:
            logger.warning(f"密码不匹配: '{password}' != '{settings.ADMIN_PASSWORD}'")
            return error_response("用户名或密码错误", 401)
        
        # 生成JWT token
        token_data = {
            "sub": username,
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        
        token = jwt.encode(token_data, settings.SECRET_KEY, algorithm="HS256")
        logger.info(f"登录成功: 已生成token，类型={type(token)}")
        
        # 确保token是字符串
        if isinstance(token, bytes):
            token = token.decode("utf-8")
            
        logger.info(f"返回token类型: {type(token)}")    
        
        return success_response({
            "token": token,
            "username": username
        })
    except Exception as e:
        logger.error(f"登录时出错: {str(e)}")
        return error_response(f"登录时出错: {str(e)}", 500)

@router.get("/messages", dependencies=[Depends(verify_token)])
async def get_submitted_messages():
    """
    获取所有已提交的表单消息
    
    返回:
        - 所有消息的列表
    """
    try:
        # 尝试连接数据库
        logger.info("正在尝试从数据库读取消息...")
        
        # 从MongoDB获取所有消息
        cursor = contacts_collection.find({})
        messages = await cursor.to_list(length=100)
        
        # 处理ObjectId
        for message in messages:
            message["_id"] = str(message["_id"])
        
        logger.info(f"成功从数据库读取到 {len(messages)} 条消息")
        return success_response({
            "messages": messages,
            "count": len(messages),
            "dbStatus": "已成功连接数据库并读取消息"
        })
    except Exception as e:
        error_msg = f"获取消息失败: {str(e)}"
        logger.error(error_msg)
        
        # 返回更详细的错误信息，帮助诊断问题
        return error_response(
            message=error_msg, 
            status_code=500,
            data={
                "dbStatus": "数据库连接失败，请检查数据库配置和连接",
                "errorDetails": str(e)
            }
        )

@router.get("/status", dependencies=[Depends(verify_token)])
async def get_system_status():
    """
    获取系统状态
    
    返回:
        - 系统状态信息
    """
    # 检查MongoDB连接
    mongodb_status = "正常"
    try:
        # 简单的MongoDB ping测试
        await client.admin.command('ping')
    except Exception as e:
        mongodb_status = f"错误: {str(e)}"
    
    return success_response({
        "mongodb_status": mongodb_status,
        "timestamp": datetime.utcnow().isoformat(),
        "admin_password_configured": bool(settings.ADMIN_PASSWORD),
        "admin_password": settings.ADMIN_PASSWORD[:3] + "***" if settings.ADMIN_PASSWORD else None
    })

@router.get("/contact-messages", dependencies=[Depends(verify_token)])
async def get_contact_messages():
    """
    获取所有联系消息
    
    返回:
        - 联系消息列表
    """
    try:
        # 尝试连接数据库
        logger.info("正在尝试从数据库读取联系消息...")
        
        # 从contacts集合获取所有消息
        cursor = contacts_collection.find({}).sort("createdAt", -1)
        messages = await cursor.to_list(length=100)
        
        # 处理ObjectId
        for message in messages:
            message["id"] = str(message["_id"])
            del message["_id"]
        
        logger.info(f"成功从数据库读取到 {len(messages)} 条联系消息")
        return success_response(data=messages)
    except Exception as e:
        error_msg = f"获取联系消息失败: {str(e)}"
        logger.error(error_msg)
        return error_response(message=error_msg, status_code=500) 