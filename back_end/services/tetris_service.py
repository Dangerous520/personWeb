from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId
from config.settings import MONGODB_URI, DB_NAME
from models.tetris_score import TetrisScoreModel, TetrisScoreInDB
from typing import List, Dict, Any


class TetrisService:
    def __init__(self):
        """初始化俄罗斯方块服务"""
        self.client = AsyncIOMotorClient(MONGODB_URI)
        self.db = self.client[DB_NAME]
        self.collection = self.db["tetris_scores"]

    async def save_score(self, score_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        保存玩家得分
        
        参数:
            score_data: 分数数据
            
        返回:
            保存的分数记录
        """
        # 添加创建时间
        score_data["createdAt"] = datetime.utcnow()
        
        # 插入数据
        result = await self.collection.insert_one(score_data)
        
        # 获取插入的数据
        saved_score = await self.collection.find_one({"_id": result.inserted_id})
        
        # 转换_id为字符串
        if saved_score:
            saved_score["id"] = str(saved_score["_id"])
            del saved_score["_id"]
            
        return saved_score

    async def get_scores(self, limit: int = 10, skip: int = 0, sort_field: str = "score") -> List[Dict[str, Any]]:
        """
        获取分数排行榜
        
        参数:
            limit: 返回的记录数量上限
            skip: 跳过的记录数量
            sort_field: 排序字段
            
        返回:
            分数记录列表
        """
        # 确定排序方向和字段
        sort_direction = -1  # 默认降序
        
        # 查询分数
        cursor = self.collection.find()
        
        # 排序
        if sort_field == "date":
            cursor = cursor.sort("createdAt", sort_direction)
        else:
            cursor = cursor.sort("score", sort_direction)
        
        # 分页
        cursor = cursor.skip(skip).limit(limit)
        
        # 转换结果
        scores = []
        async for score in cursor:
            score["id"] = str(score["_id"])
            del score["_id"]
            scores.append(score)
        
        return scores

    async def get_stats(self) -> Dict[str, Any]:
        """
        获取分数统计信息
        
        返回:
            统计信息
        """
        total_count = await self.collection.count_documents({})
        
        # 获取最高分
        highest_score = None
        if total_count > 0:
            highest_score_doc = await self.collection.find_one(
                sort=[("score", -1)]
            )
            if highest_score_doc:
                highest_score = highest_score_doc["score"]
        
        # 获取平均分
        average_score = 0
        if total_count > 0:
            pipeline = [
                {"$group": {"_id": None, "avg": {"$avg": "$score"}}}
            ]
            result = await self.collection.aggregate(pipeline).to_list(length=1)
            if result and len(result) > 0:
                average_score = round(result[0]["avg"], 2)
        
        return {
            "total_players": total_count,
            "highest_score": highest_score,
            "average_score": average_score
        }