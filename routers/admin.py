"""后台管理 API（数据统计、趋势、状态分布、今日订单）"""

from fastapi import APIRouter
from database import get_db
from data import get_product_name, today_str

router = APIRouter()


@router.get("/api/admin/overview")
def admin_overview():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) as cnt FROM orders")
    total_orders = c.fetchone()["cnt"]
    c.execute("SELECT SUM(total_price) as s FROM orders")
    total_revenue = c.fetchone()["s"] or 0
    c.execute("SELECT COUNT(*) as cnt FROM orders WHERE status='refunded'")
    total_refunds = c.fetchone()["cnt"]
    c.execute("SELECT COUNT(*) as cnt FROM users")
    user_count = c.fetchone()["cnt"]
    c.execute("SELECT product_id FROM orders GROUP BY product_id ORDER BY SUM(quantity) DESC LIMIT 1")
    top = c.fetchone()
    top_name = get_product_name(str(top['product_id'])) if top else "暂无"
    td = today_str()
    c.execute("SELECT SUM(total_price) as s FROM orders WHERE order_date=%s", (td,))
    rev_today = c.fetchone()["s"] or 0
    c.execute("SELECT COUNT(*) as cnt FROM orders WHERE order_date=%s", (td,))
    ord_today = c.fetchone()["cnt"]
    conn.close()
    return {"code": 0, "data": {
        "total_orders": total_orders,
        "total_revenue": round(float(total_revenue), 2),
        "total_refunds": total_refunds,
        "user_count": user_count,
        "top_product": top_name,
        "revenue_today": round(float(rev_today), 2),
        "orders_today": ord_today,
    }}


@router.get("/api/admin/revenue-trend")
def revenue_trend(days: int = 30):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT date,total_orders,total_revenue FROM daily_stats ORDER BY date DESC LIMIT %s", (days,))
    rows = c.fetchall()
    conn.close()
    data = [
        {
            "date": r["date"].strftime("%Y-%m-%d") if hasattr(r["date"], "strftime") else str(r["date"]),
            "revenue": float(r["total_revenue"]),
            "orders": r["total_orders"],
        }
        for r in reversed(rows)
    ]
    return {"code": 0, "data": data}


@router.get("/api/admin/order-status")
def order_status():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT status,COUNT(*) as cnt FROM orders GROUP BY status")
    rows = c.fetchall()
    conn.close()
    MAP = {"completed": "已完成", "refunded": "已退款", "pending": "处理中"}
    return {"code": 0, "data": [{"status": MAP.get(r["status"], r["status"]), "count": r["cnt"]} for r in rows]}


@router.get("/api/admin/today-orders")
def today_orders():
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT order_id,customer_name,product_id,quantity,total_price,status,order_date FROM orders WHERE order_date=%s ORDER BY order_id LIMIT 50", (today_str(),))
    rows = c.fetchall()
    conn.close()
    MAP = {"completed": "已完成", "refunded": "已退款", "pending": "处理中"}
    data = [
        {
            "order_id": f"ORD{r['order_id']}" if not str(r['order_id']).startswith("ORD") else r['order_id'],
            "user_name": r["customer_name"],
            "product_name": get_product_name(str(r['product_id'])),
            "quantity": r["quantity"],
            "amount": float(r["total_price"]),
            "status": MAP.get(r["status"], r["status"]),
        }
        for r in rows
    ]
    return {"code": 0, "data": data}
