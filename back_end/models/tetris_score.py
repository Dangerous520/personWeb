from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class TetrisScoreModel(BaseModel):
    """俄罗斯方块得分提交模型"""
    player_name: str = Field(..., min_length=1, max_length=20)
    score: int = Field(..., ge=0)
    level: int = Field(..., ge=1)
    lines: int = Field(..., ge=0)
    duration: int = Field(..., description="游戏持续时间（秒）")


class TetrisScoreInDB(TetrisScoreModel):
    """数据库中的俄罗斯方块得分模型"""
    id: str
    created_at: datetime