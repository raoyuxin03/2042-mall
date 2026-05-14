# 2042百货线上商城

科幻风格电商 Demo。FastAPI + MySQL 后端，纯前端单页应用，Dify AI 客服集成。

## 项目文件结构

```
D:\claudecode\2042-mall\
├── main.py                 # FastAPI 后端（API + 静态文件托管）
├── requirements.txt        # Python 依赖
├── shop.db                 # SQLite 数据库（仅供本地测试）
├── README.md               # 项目文档
├── admin.html              # 后台数据管理页面
└── static/
    ├── index.html           # 商城首页
    ├── css/
    │   └── style.css        # 商城样式
    └── js/
        └── app.js           # 商城 JavaScript
```

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | HTML + CSS + JS，TailwindCSS CDN |
| 后端 | Python FastAPI + uvicorn |
| 数据库 | MySQL（库名 `2042_mall`） |
| AI客服 | Dify Chatbot（WebApp iframe / embed.min.js） |

## 页面功能

### 商城首页（`/`）

| 功能 | 说明 |
|------|------|
| 登录/注册 | 用户名+密码，默认密码 `2042`，记住密码选项，游客跳过浏览 |
| 欢迎弹窗 | 首次登录后展示，可关闭 |
| 商品展示 | 30款科幻商品卡片，flex-wrap 网格 |
| 分类侧边栏 | 左侧固定，按 Emoji 分类筛选 |
| 搜索 | 按商品名/品牌实时搜索 |
| 排序 | 按价格升降序 |
| 购物车 | 侧栏面板，加减数量、删除、清空、localStorage 持久化 |
| 购买确认弹窗 | 点击"购买"弹出确认框，可调整数量 |
| 结算弹窗 | 下单成功，显示订单摘要、订单编号 |
| Dify AI客服 | 右下角悬浮按钮，Dify原生embed方式 |
| 科幻时钟 | 导航栏实时 2042 年时间 |
| 回到顶部 | 滚动超过400px显示 |
| 后台管理入口 | 导航栏"后台管理"按钮 |
| 切换用户 | 用户名旁"切换"按钮返回登录页 |

### 后台管理（`/admin.html`）

| 功能 | 说明 |
|------|------|
| 统计卡片 | 总订单数、总营业额、注册用户、退款单数 |
| 今日销售明细 | 表格展示当日订单（订单号/用户/商品/数量/金额/状态） |
| 订单状态分布 | 已完成/已退款/处理中 状态柱状图 |
| Dify数据助手 | 右下角悬浮按钮，AI对话查询数据 |

## 快速启动

### Docker 部署（推荐）

```bash
# 1. 构建并启动（MySQL + 商城后端）
docker compose up -d

# 2. 迁移已有数据（可选，首次部署时执行）
python migrate_data.py

# 3. 访问
# 商城首页: http://localhost:8099/
# 后台管理: http://localhost:8099/admin.html
```

### 本地开发

```bash
pip install -r requirements.txt
# 确保本地 MySQL 已运行，数据库 2042_mall 已创建
python -m uvicorn main:app --host 0.0.0.0 --port 8099
```

## 数据库说明

当前连接 MySQL 的 `2042_mall` 库。有两张核心表：

**daily_stats**（每日统计数据）：
- date, total_orders, total_revenue, top_product, refund_count
- 数据范围：2042-03-13 ~ 2042-10-01（模拟数据）

**orders**（订单数据）：
- order_id, customer_name, product_id, quantity, total_price, status, order_date
- status 枚举：completed, refunded, pending
- 数据范围：2042-03-13 ~ 2042-10-01（1008条模拟订单）

其他表（users, tokens, cart）由后端自动创建。

## API 接口

| 路径 | 方法 | 参数 | 说明 |
|------|------|------|------|
| `/api/products` | GET | - | 返回30款商品 |
| `/api/register` | POST | username, password | 注册 |
| `/api/login` | POST | username, password | 登录（默认密码2042自动注册）|
| `/api/cart` | GET | token | 获取购物车 |
| `/api/cart/sync` | POST | token, items | 同步购物车 |
| `/api/admin/overview` | GET | - | 后台总览数据 |
| `/api/admin/revenue-trend` | GET | days | 营业额趋势 |
| `/api/admin/order-status` | GET | - | 订单状态分布 |
| `/api/admin/today-orders` | GET | - | 今日订单明细 |

## AI 客服

商城页使用 Dify Chatbot embed 方式嵌入，配置在 `static/index.html`：
```javascript
window.difyChatbotConfig = {
  token: 'jlyk0eE518cwWwGP',
  baseUrl: 'http://localhost',  // 部署时改为线上地址
}
```

后台管理页使用 Dify 工作流"2042后台数据管理系统"，配置在 `admin.html`：
```javascript
window.difyChatbotConfig = {
  token: 'kJAqSQG4EGo1cgFs',
  baseUrl: 'http://localhost',
}
```

部署线上时需要将 `baseUrl` 改为 Dify 的公网地址，否则 AI客服无法加载。

## 后端配置

数据库密码通过环境变量读取，不硬编码：
```python
DB_CONFIG = {
    "password": os.getenv("MYSQL_PASSWORD", "123456"),  # 默认值123456
}
```

## 商品数据

30款商品定义在 `main.py` 的 `PRODUCTS` 数组中。前端通过 `GET /api/products` 加载，不存在数据不同步问题。

## 已知说明

- 后台管理的订单数据为模拟数据（随机生成），和商城主页的商品名称不直接关联
- Dify 的 baseUrl 当前为 `http://localhost`，仅本地可用
- 静态文件通过 FastAPI 的 `/assets` 路径托管（非 nginx）
