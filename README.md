# 2042百货线上商城

科幻风格电商 Demo。FastAPI + MySQL 后端，集成两个 Dify AI 工作流（智能客服 + NL2SQL 数据分析），Docker 容器化部署。

> 项目地址：https://github.com/raoyuxin03/2042-mall

---

## 1. 架构说明

### 系统架构

```
┌───────────────────────────────────────────────────────────────┐
│                      用户（浏览器）                             │
└──────┬──────────────────────┬──────────────────────┬──────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  商城页面     │    │  后台管理页面     │    │   Dify AI 客服   │
│  index.html  │    │  admin.html      │    │   embed.min.js   │
│  TailwindCSS │    │  ECharts 图表     │    │   悬浮 Chatbot   │
└──────┬───────┘    └────────┬─────────┘    └──────────────────┘
       │                     │
       │    HTTP JSON        │
       ▼                     ▼
┌────────────────────────────────────┐
│   FastAPI 后端 (:8099)             │
│   ├── /api/products               │
│   ├── /api/login / /api/register   │
│   ├── /api/cart / /api/cart/sync   │
│   ├── /api/admin/overview          │
│   ├── /api/admin/revenue-trend     │
│   ├── /api/admin/order-status      │
│   └── /api/admin/today-orders      │
└──────────────┬─────────────────────┘
               │
               ▼
┌────────────────────────┐   ┌──────────────────────────┐
│  MySQL (2042_mall)     │   │  Dify Docker 服务         │
│  ├─ users/tokens/cart  │   │  ├─ 智能客服工作流        │
│  ├─ orders (1008条)    │   │  ├─ 数据分析工作流        │
│  └─ daily_stats(204条) │   │  └─ Weaviate 向量数据库   │
└────────────────────────┘   └──────────────────────────┘
```

### 项目结构

```
├── main.py                 # FastAPI 后端入口（API + 静态文件）
├── Dockerfile              # 容器构建文件
├── docker-compose.yml      # 多服务编排（FastAPI + MySQL）
├── requirements.txt        # Python 依赖
├── migrate_data.py         # 数据迁移脚本
├── admin.html              # 后台管理页面
└── static/
    ├── index.html           # 商城首页
    ├── css/style.css        # 样式
    └── js/app.js            # 前端逻辑
```

### 核心流程

**用户侧数据流：**
```
用户打开商城 → 登录/游客 → 浏览/搜索商品 → 加购物车 → 下单
     ↑                                                    │
     └──────── localStorage 持久化 ────────────────────────┘
```

**AI 客服数据流（智能客服工作流）：**
```
用户提问 → Dify chatbot embed → 意图识别(LLM)
    ├── 售前 → 知识库检索(RAG) → 有结果 → 回答
    │                              └─ 无结果 → 兜底回复
    ├── 售后 → 状态机(conversation variable) → 处理
    ├── 订单查询 → 物流查询(代码节点) → 回复
    └── 其他 → 闲聊回复
```

**数据分析数据流（后台数据管理工作流）：**
```
用户提问 → 意图识别
    ├── daily_stats → 获取表结构 → LLM生成SQL
    ├── orders → 获取表结构 → LLM生成SQL
    └── reject → 引导用户
                        ↓
                 代码节点清洗(SQL提取)
                        ↓
                 MySQL执行查询
                        ↓
                 LLM分析结果 + 生成ECharts配置
                        ↓
                 折线图 / 柱状图 / 饼图 / 纯文本
```

---

## 2. 关键 Prompt 与 Vibe 思路

### 智能客服工作流

**系统提示词（意图识别）：**
```
分析用户输入的意图，分类为以下三类之一：
- pre_sale：询问商品信息、功能、价格、推荐
- after_sale：退换货、维修、投诉、售后问题
- order_query：查询订单状态、物流信息
- other：闲聊、打招呼、非以上三类

仅输出分类名称，不要输出其他内容。
```

**设计思路：**
- 意图识别后接代码节点清洗，过滤 LLM 输出的 `\<think\>` 标签和格式噪声
- 售后模块使用 Conversation Variable 记录工单状态（waiting/completed），实现多轮售后对话
- 知识库检索后做二次判空：无匹配时走兜底回复，避免 LLM 编造答案

### 数据分析工作流

**关键 Prompt（SQL 生成）：**
```
你是一个 MySQL 数据分析助手。
当前数据库的表结构如下：
{table_schema}

请根据用户的问题生成 SQL 查询语句，要求：
1. 只输出 SQL 语句，不要输出任何解释
2. 使用 SELECT 查询，不允许修改数据
3. 日期字段格式为 YYYY-MM-DD
4. 聚合结果使用易读的别名
```

**设计思路：**
- 先通过代码节点获取 MySQL 表结构再注入 prompt——数据库结构变了不需要改工作流
- 编写代码清洗节点去除 markdown 标记（\`\`\`sql）、`\<think\>` 标签，提取合法 SELECT 语句
- 查询结果送入 LLM 分析后输出 ECharts JSON 配置，代码节点解析后路由到对应图表类型

### Vibe Coding 思路

前端页面通过 Claude Code 对话式编程（vibe coding）完成。核心模式：

- **描述需求**："做一个科幻风格电商首页，深色主题，带 2042 年时钟"
- **AI 生成代码**：Claude Code 根据自然语言描述生成 HTML/CSS/JS
- **人工确认调整**：检查生成效果，提出修改意见（"侧边栏固定"、"颜色调亮"）
- **迭代**：重复描述 → 生成 → 调整 → 确认

前端定位为"够用即可"，开发精力集中在后端架构和 Dify 工作流设计。

---

## 3. AI 调用逻辑

### Dify Chatbot Embed

AI 客服通过 Dify 原生 embed 脚本注入前端：

```javascript
window.difyChatbotConfig = {
  token: 'jlyk0eE518cwWwGP',
  baseUrl: 'http://localhost',   // 部署时改为 Dify 公网地址
};
```

Dify 工作流内部：
- **LLM 节点**：调用 DeepSeek / Qwen 模型，用于意图识别、SQL 生成、结果分析
- **知识检索节点**：基于 Weaviate 向量数据库，混合检索（关键词 + 向量）+ Rerank 重排序
- **代码节点**：Python 执行，清洗 LLM 输出、执行 SQL、聚合数据
- **变量节点**：Conversation Variable 记录售后状态
- **条件分支**：根据意图/查询结果/变量状态路由到不同分支
- **直接回复节点**：最终输出给用户

### Text-to-SQL 执行链路

```
用户输入 → LLM生成SQL → 代码清洗(正则提取SELECT) → pymysql执行
                                                      ↓
                                                LLM分析结果
                                                      ↓
                                          ECharts JSON配置输出
                                                      ↓
                                         前端渲染图表(折线/柱状/饼图)
```

安全措施：代码节点中过滤 DROP / DELETE / UPDATE / INSERT / ALTER 等非查询语句。

### 数据更新策略

- 商品数据：后端 `main.py` 中 `PRODUCTS` 数组定义，API 读取
- 购物车：前端 localStorage + API `/api/cart/sync` 同步
- 订单数据：模拟数据存储在 MySQL（orders 表 1008 条）
- 统计报表：模拟数据存储在 MySQL（daily_stats 表 204 条）
- Dify 知识库：商品规格文档 + FAQ 约 200 条，Dify 内置 embedding 向量化

---

## 4. 部署步骤说明

### Docker 部署（本地）

```bash
# 1. 克隆项目
git clone https://github.com/raoyuxin03/2042-mall.git
cd 2042-mall

# 2. 一键启动（会自动构建并运行 FastAPI + MySQL）
docker compose up -d

# 3. 访问
# 商城首页: http://localhost:8099/
# 后台管理: http://localhost:8099/admin.html
```

### 本地开发

```bash
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8099
# 需要本地 MySQL，数据库 2042_mall 已创建
```

### 生产部署（云服务器）

```bash
# 1. 服务器安装 Docker 和 docker-compose

# 2. 拉取代码
git clone https://github.com/raoyuxin03/2042-mall.git
cd 2042-mall

# 3. 修改 Dify baseUrl
# 在 static/index.html 和 static/admin.html 中，将 baseUrl 改为 Dify 的公网地址

# 4. 启动
docker compose up -d

# 5. 配置 DNS 和 HTTPS（可选，推荐使用 Nginx 反向代理）
```

#### DNS 配置

如需自定义域名：

```
域名解析：将你的域名（如 mall.example.com）添加 A 记录指向服务器 IP
Nginx 配置：

server {
    listen 80;
    server_name mall.example.com;

    location / {
        proxy_pass http://127.0.0.1:8099;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### HTTPS 配置（使用 Let's Encrypt）

```bash
# 安装 certbot
apt install certbot python3-certbot-nginx

# 申请证书并自动配置 Nginx
certbot --nginx -d mall.example.com

# 自动续期（certbot 默认已添加定时任务）
certbot renew --dry-run
```

### 依赖说明

| 组件 | 版本 | 用途 |
|------|------|------|
| Docker Desktop | - | 容器运行环境 |
| FastAPI | 0.115.6 | Web 框架 |
| uvicorn | 0.34.0 | ASGI 服务器 |
| pymysql | 1.1.1 | MySQL 连接 |
| MySQL | 8.0 | 数据库 |
| Dify | 1.13.3 | AI 工作流平台 |
| Weaviate | 1.27.0 | 向量数据库 |

---

## 数据库

**MySQL 库名：** `2042_mall`

| 表名 | 说明 | 数据量 |
|------|------|--------|
| users | 用户（自动创建） | 动态 |
| tokens | 登录令牌（自动创建） | 动态 |
| cart | 购物车（自动创建） | 动态 |
| orders | 订单记录 | 1008 条（模拟） |
| daily_stats | 每日统计数据 | 204 条（模拟） |

模拟数据日期范围：2042-03-13 ~ 2042-10-01

---

## 说明

- 后台订单数据为模拟数据，与商城购买流程无直接关联
- Dify baseUrl 当前为 `http://localhost`，线上部署需改为 Dify 公网地址
- 静态文件通过 FastAPI 托管，生产环境建议使用 Nginx
