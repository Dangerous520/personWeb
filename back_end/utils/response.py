from typing import Any, Dict, Optional, Union, List


def success_response(
        data: Any = None,
        message: str = "操作成功",
        status_code: int = 200
) -> Dict[str, Any]:
    """
    标准成功响应格式
    
    Args:
        data: 响应数据
        message: 响应消息
        status_code: 状态码
        
    Returns:
        Dict: 格式化的响应
    """
    response = {
        "success": True,
        "message": message,
        "status_code": status_code,
        "data": data if data is not None else []
    }
    return response


def error_response(
        message: str = "操作失败",
        status_code: int = 400,
        error_details: Optional[Any] = None
) -> Dict[str, Any]:
    """
    标准错误响应格式
    
    Args:
        message: 错误消息
        status_code: 状态码
        error_details: 详细错误信息
        
    Returns:
        Dict: 格式化的响应
    """
    response = {
        "success": False,
        "message": message,
        "status_code": status_code,
        "error": error_details
    }
    return response