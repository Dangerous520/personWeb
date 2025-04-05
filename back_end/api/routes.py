from fastapi import APIRouter
from datetime import datetime
from api import tetris, contact, admin
from utils.response import success_response

router = APIRouter()

# 注册俄罗斯方块路由
router.include_router(tetris.router, prefix="/tetris", tags=["tetris"])

# 注册联系表单路由
router.include_router(contact.router, prefix="/contact", tags=["contact"])

# 注册管理员路由
router.include_router(admin.router, prefix="/admin", tags=["admin"])

# 添加健康检查端点
@router.get("/health", tags=["health"])
async def health_check():
    """
    健康检查端点
    
    返回:
        dict: 服务状态信息
    """
    return success_response(
        message="Service is healthy",
        data={
            "status": "ok",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@router.get("/")
async def root():
    """API根路径"""
    return success_response(
        message="欢迎使用邓宗林个人主页API",
        data={
            "version": "1.0.0",
            "docs_url": "/docs",
            "redoc_url": "/redoc"
        }
    )