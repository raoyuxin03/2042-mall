# 小饶的虚拟科技百货

电商 Demo。FastAPI + MySQL 后端，集成两个 Dify AI 工作流（智能客服 + NL2SQL 数据分析），支持真实用户下单和实时数据查询，Docker 容器化部署。

> 项目地址：https://github.com/raoyuxin03/2042-mall

---

## 1. 架构说明

### 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户（浏览器）                             │
└──────┬──────────────────────┬──────────────────────┬────────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  商城页面     │    │  后台管理页面     │    │   Dify AI 客服   │
│  index.html  │    │  admin.html      │    │   embed.min.js   │
│  TailwindCSS │    │  趋势图+状态分布   │    │   悬浮 Chatbot   │
└──────┬───────┘    └────────┬─────────┘    └──────────────────┘
       │                     │
       │    HTTP JSON        │
       ▼                     ▼
┌──────────────────────────────────────┐
│  FastAPI 后端 (:8099)                │
│  ├── /api/products                   │
│  ├── /api/login / /api/register      │
│  ├── /api/cart / /api/cart/sync      │
│  ├── /api/orders（用户下单→写入DB）   │
│  ├── /api/admin/overview             │
│  ├── /api/admin/revenue-trend        │
│  ├── /api/admin/order-status         │
│  └── /api/admin/today-orders         │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────┐
│  MySQL (2042_mall)       │
│  ├─ users / tokens / cart│
│  ├─ orders（真实下单数据）│
│  ├─ shipments（物流记录） │
│  └─ daily_stats          │
└──────────────────────────┘
```

### 项目结构

```
├── main.py                 # FastAPI 后端入口（API + 静态文件）
├── Dockerfile              # 容器构建文件
├── docker-compose.yml      # 多服务编排（FastAPI + MySQL）
├── requirements.txt        # Python 依赖
├── product_catalog.txt     # 商品目录（知识库用）
└── static/
    ├── index.html           # 商城首页
    ├── admin.html           # 后台管理页面
    ├── css/style.css        # 样式
    └── js/app.js            # 前端逻辑
```

### 核心流程

**用户购物流程（真实写入数据库）：**
```
用户登录（调后端API获取token）→ 浏览商品 → 加购物车 → 结算下单
                                                              │
                                                   ├─ orders 表写入
                                                   └─ shipments 表写入（物流记录）
```

**AI 客服数据流（智能客服工作流）：**
```
用户提问 → Dify chatbot embed → 意图识别(LLM)
    ├── 售前 → 知识库检索(RAG) → 回答
    ├── 售后 → 多轮对话(状态变量 WAITING/DONE) → 受理
    ├── 订单查询 → LLM生成SQL → 代码清洗 → database插件查物流 → 回复
    ├── 转人工 → 转接提示
    └── 闲聊 → 引导用户说出真实需求
```

**数据分析数据流（后台数据管理工作流，NL2SQL）：**
```
用户提问 → 意图识别(daily_stats / orders / reject)
    ├── daily_stats → 获取表结构 → LLM生成SQL → 代码清洗 → MySQL执行
    ├── orders → 获取表结构 → LLM生成SQL → 代码清洗 → MySQL执行
    └── reject → 引导用户
                                        ↓
                            LLM分析结果 + ECharts JSON配置
                                        ↓
                     折线图 / 柱状图 / 饼图 / 纯文本
```

---

## 2. 关键设计思路

### 智能客服工作流亮点

- **多意图路由**：售前/售后/查物流/转人工四路分流，用户可在对话中自由切换意图
- **多轮对话状态管理**：通过 Conversation Variable 记录售前/售后进度（WAITING/DONE），结合代码节点判断用户输入是否包含有效信息，避免闲聊被拉进售后流程
- **真实物流查询**：从 MySQL `shipments` 表读取实时物流数据，而非模拟假数据
- **知识库 RAG**：商品信息 + 售后政策 + 常见问题，用户咨询商品时自动检索知识库后生成回答

### 数据分析工作流亮点

- **NL2SQL 闭环**：用户用中文提问 → LLM 自动生成 SQL → 清洗执行 → LLM 分析结果 → ECharts 可视化，全链路自动化
- **表结构动态注入**：通过 Get Table Schema 节点获取 MySQL 表结构再注入 prompt，数据库结构变了不需要改工作流
- **SQL 安全过滤**：代码节点中过滤 DROP / DELETE / UPDATE / INSERT / ALTER 等非查询语句
- **多图表支持**：LLM 输出 JSON 图表配置，代码节点解析后动态路由到折线图/柱状图/饼图

### 后端亮点

- **用户下单真实写入数据库**：前端结算 → POST /api/orders → orders 表 + shipments 表双写，后台和数据系统实时可查
- **登录注册走后端 API**：获取 token 鉴权，而非纯 localStorage 模拟
- **动态日期**：所有"今日"数据跟随系统真实时间，非硬编码

---

## 3. 技术栈

| 组件 | 版本 | 用途 |
|------|------|------|
| FastAPI | 0.115.6 | Python Web 框架 |
| uvicorn | 0.34.0 | ASGI 服务器 |
| pymysql | 1.1.1 | MySQL 连接 |
| MySQL | 8.0 | 数据库 |
| Docker | - | 容器化部署 |
| Dify | 社区版 | AI 工作流平台 |
| DeepSeek / 通义千问 | - | 大语言模型 |

---

## 4. 部署

```bash
# 1. 克隆项目
git clone https://github.com/raoyuxin03/2042-mall.git
cd 2042-mall

# 2. 一键启动
docker compose up -d

# 3. 访问
# 商城首页: http://localhost:8099/
# 后台管理: http://localhost:8099/admin.html
```

> 注意：需要自行部署 Dify 并配置两个工作流（智能客服 3.0 + 后台数据管理系统），将 Dify 地址填入 `static/index.html` 和 `static/admin.html` 中的 `baseUrl`。

---

## 5. 数据库

**库名：** `2042_mall`

| 表名 | 说明 |
|------|------|
| users | 用户表 |
| tokens | 登录令牌 |
| cart | 购物车 |
| orders | 订单记录（用户下单实时写入） |
| shipments | 物流记录（下单时自动生成） |
| daily_stats | 每日统计数据 |
