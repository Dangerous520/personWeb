# 赛博张三个人主页后端

这是一个基于FastAPI开发的个人主页后端服务，提供俄罗斯方块游戏分数存储和联系表单功能。

## 技术栈

- Python 3.12.6
- FastAPI
- MongoDB
- Uvicorn

## 项目结构

```
portfolio-backend/
│
├── app.py                 # 应用入口点
├── config/
│   ├── __init__.py
│   └── settings.py        # 配置文件（数据库连接、API密钥等）
│
├── api/
│   ├── __init__.py
│   ├── routes.py          # API路由统一注册
│   ├── tetris.py          # 俄罗斯方块游戏API
│   └── contact.py         # 联系表单API
│
├── models/
│   ├── __init__.py
│   ├── tetris_score.py    # 俄罗斯方块分数模型
│   └── contact.py         # 联系信息模型
│
├── services/
│   ├── __init__.py
│   ├── tetris_service.py  # 游戏数据处理逻辑
│   └── contact_service.py # 联系表单处理逻辑
│
├── utils/
│   ├── __init__.py
│   ├── validators.py      # 数据验证工具
│   └── response.py        # 响应格式化工具
│
├── middlewares/
│   ├── __init__.py
│   ├── cors.py            # CORS中间件
│   └── rate_limit.py      # 速率限制中间件
│
├── requirements.txt       # 项目依赖
└── README.md              # 项目说明文档
```

## 安装

1. 克隆代码库

```bash
git clone <你的仓库地址>
cd portfolio-backend
```

2. 创建并激活虚拟环境

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
```

3. 安装依赖

```bash
pip install -r requirements.txt
```

4. 环境变量配置

创建`.env`文件并设置必要的环境变量：

```
MONGODB_URI=mongodb://localhost:27017
DB_NAME=portfolio_db
API_KEY=your-secret-api-key
```

## MongoDB 设置指南

### 安装 MongoDB

#### Windows

1. 访问 [MongoDB 下载页面](https://www.mongodb.com/try/download/community)，下载并安装 MongoDB Community 版本
2. 安装时选择"Complete"安装选项
3. 选择"Run service as Network Service user"并保留默认的数据目录
4. 安装 MongoDB Compass（可选，但推荐用于管理数据库）

#### macOS

使用 Homebrew 安装:

```bash
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux (Ubuntu/Debian)

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### 启动 MongoDB 服务

#### Windows

MongoDB 会作为 Windows 服务自动启动。如果未启动，可以在"服务"应用中手动启动 MongoDB 服务。

#### macOS

```bash
brew services start mongodb-community
```

#### Linux

```bash
sudo systemctl start mongod
sudo systemctl enable mongod  # 设置开机自启
```

### 创建数据库和集合

1. 打开 MongoDB Compass 或使用 MongoDB Shell
2. 连接到 MongoDB（默认 URL 为 `mongodb://localhost:27017`）
3. 创建名为 `portfolio_db` 的数据库
4. 在该数据库中创建两个集合：`tetris_scores` 和 `contacts`

### 使用 MongoDB Shell 创建数据库和集合

```bash
# 启动 MongoDB Shell
mongosh

# 创建和使用数据库
use portfolio_db

# 创建集合（通过插入一条临时数据）
db.tetris_scores.insertOne({ temp: true })
db.contacts.insertOne({ temp: true })

# 删除临时数据
db.tetris_scores.deleteOne({ temp: true })
db.contacts.deleteOne({ temp: true })

# 检查集合是否已创建
show collections
```

### 验证数据库连接

确保你的 `.env` 文件中的 MongoDB URI 正确。如果需要身份验证，URI 格式如下：

```
MONGODB_URI=mongodb://username:password@localhost:27017
```

## 运行

开发环境：

```bash
python app.py
```

或者：

```bash
uvicorn app:app --reload
```

生产环境：

```bash
gunicorn app:app -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000
```

## API文档

启动服务后，可以通过以下URL访问API文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API端点

### 俄罗斯方块分数 API

- `GET /api/tetris/scores` - 获取分数列表，支持分页和排序
  - 查询参数：
    - `limit`: 返回结果数量限制 (默认: 10)
    - `skip`: 跳过的结果数量 (默认: 0)
    - `sort`: 排序方式，可选值: `score`、`date` (默认: `score`)
    
- `POST /api/tetris/scores` - 保存新的分数记录
  - 请求体：
    ```json
    {
      "playerName": "玩家名称",
      "score": 1000,
      "level": 5,
      "lines": 40,
      "date": "2023-01-01T12:00:00Z"
    }
    ```

### 联系表单 API

- `POST /api/contact` - 提交联系表单
  - 请求体：
    ```json
    {
      "name": "联系人姓名",
      "email": "email@example.com",
      "message": "联系消息内容"
    }
    ```

### 健康检查 API

- `GET /api/health` - 服务健康检查
  - 响应：
    ```json
    {
      "success": true,
      "message": "Service is healthy",
      "data": {
        "status": "ok",
        "timestamp": "2023-01-01T12:00:00Z"
      }
    }
    ```

## 数据模型

### 俄罗斯方块分数

```python
{
    "id": "ObjectId",          # MongoDB 自动生成的ID
    "playerName": "String",    # 玩家名称
    "score": "Integer",        # 分数
    "level": "Integer",        # 等级
    "lines": "Integer",        # 消除的行数
    "date": "DateTime",        # 记录日期
    "createdAt": "DateTime"    # 创建时间
}
```

### 联系表单

```python
{
    "id": "ObjectId",          # MongoDB 自动生成的ID
    "name": "String",          # 联系人姓名
    "email": "String",         # 电子邮箱
    "message": "String",       # 消息内容
    "status": "String",        # 状态 (new, read, replied)
    "createdAt": "DateTime",   # 创建时间
    "updatedAt": "DateTime"    # 更新时间
}
```

## 故障排除

### 数据库连接问题

如果遇到数据库连接问题，请检查：

1. MongoDB 服务是否运行
2. `.env` 文件中的 `MONGODB_URI` 是否正确
3. 确保网络防火墙未阻止连接
4. 如果使用身份验证，确保用户名和密码正确

### 服务无法启动

如果服务无法启动，请检查：

1. 所有依赖是否已正确安装：`pip install -r requirements.txt`
2. 端口 8000 是否已被其他应用占用
3. 查看日志输出，识别具体错误

### CORS错误

如果前端无法连接后端 API，可能是 CORS 配置问题，请检查：

1. 确保 `settings.py` 中的 `ALLOWED_ORIGINS` 包含前端域名
2. 如果在本地开发，确保添加了 `http://localhost:3000`

## 开发者

- 赛博张三 