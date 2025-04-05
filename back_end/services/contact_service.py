from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId
from config.settings import MONGODB_URI, DB_NAME
from models.contact import ContactModel


class ContactService:
    def __init__(self):
        self.client = AsyncIOMotorClient(MONGODB_URI)
        self.db = self.client[DB_NAME]
        self.collection = self.db.contacts

    async def save_contact(self, contact: ContactModel, ip_address: str = None):
        """保存联系表单"""
        contact_dict = contact.dict()
        contact_dict["created_at"] = datetime.utcnow()

        if ip_address:
            contact_dict["ip_address"] = ip_address

        result = await self.collection.insert_one(contact_dict)
        return str(result.inserted_id)

    async def get_contact_count(self):
        """获取联系表单总数"""
        return await self.collection.count_documents({})