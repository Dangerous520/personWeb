# 赛博朋克风格个人主页

这是一个带有赛博朋克风格的个人作品集网站，包含俄罗斯方块游戏和联系表单功能。前端使用Next.js构建，后端使用FastAPI。

## 前端功能

- 响应式设计，适配各种设备尺寸
- 赛博朋克风格的UI，包含霓虹灯效果
- 三维背景场景使用Three.js创建
- 可玩的俄罗斯方块游戏，包含分数保存和排行榜功能
- 终端风格的联系表单

## 技术栈

- **前端:**
  - Next.js 15+
  - React 19
  - TypeScript
  - Three.js / React Three Fiber
  - TailwindCSS
  - Radix UI
  
- **后端:**
  - FastAPI
  - MongoDB
  - Python 3.12+

## 安装与设置

### 前端

1. 克隆仓库

```bash
git clone <仓库URL>
cd neon-cyberpunk-portfolio
```

2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. 创建`.env.local`文件，配置后端API地址

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

### 后端

后端是一个独立的项目，位于`back_end`目录。详细说明请参考[后端README](../back_end/README.md)。

1. 进入后端目录

```bash
cd ../back_end
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

4. 创建`.env`文件，配置数据库连接等

```
MONGODB_URI=mongodb://localhost:27017
DB_NAME=portfolio_db
API_KEY=your-secret-api-key
```

5. 启动后端服务

```bash
python app.py
```

## 前后端集成功能

- 俄罗斯方块游戏分数保存与排行榜
- 联系表单信息提交

## 开发者

- 赛博张三

## 许可证

MIT 