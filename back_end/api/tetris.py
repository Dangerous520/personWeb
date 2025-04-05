from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from models.tetris_score import TetrisScoreModel, TetrisScoreInDB
from services.tetris_service import TetrisService
from utils.response import success_response

router = APIRouter()
tetris_service = TetrisService()

# 定义俄罗斯方块分数模型
class TetrisScoreBase(BaseModel):
    playerName: str
    score: int
    level: int
    lines: int
    date: str

class TetrisScoreCreate(TetrisScoreBase):
    pass

class TetrisScore(TetrisScoreBase):
    id: str
    createdAt: datetime

    class Config:
        orm_mode = True

@router.get("/scores", tags=["tetris"])
async def get_scores(
    limit: int = Query(10, ge=1, le=100),
    skip: int = Query(0, ge=0),
    sort: str = Query("score", regex="^(score|date)$")
):
    """
    获取俄罗斯方块游戏分数排行榜
    
    参数:
        - limit: 最多返回的结果数量，默认10
        - skip: 跳过的结果数量，默认0
        - sort: 排序字段，可选"score"或"date"，默认"score"
    
    返回:
        - 分数列表
    """
    try:
        scores = await tetris_service.get_scores(limit, skip, sort)
        # 确保返回的data是列表类型
        return success_response(message="获取分数成功", data=scores)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取分数失败: {str(e)}")

@router.post("/scores", tags=["tetris"])
async def create_score(score: TetrisScoreCreate):
    """
    保存俄罗斯方块游戏分数
    
    参数:
        - score: 分数信息
    
    返回:
        - 保存的分数信息
    """
    try:
        result = await tetris_service.save_score(score.dict())
        return success_response(message="保存分数成功", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存分数失败: {str(e)}")

@router.get("/stats")
async def get_game_stats():
    """获取游戏统计数据"""
    stats = await tetris_service.get_game_stats()
    return success_response(data=stats)