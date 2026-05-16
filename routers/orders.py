"""订单 API（下单写入 orders + shipments 表）"""

import random
from datetime import datetime
from fastapi import APIRouter, HTTPException
from database import get_db
from routers.auth import get_username_by_token
from models import CreateOrderReq
from data import today_str

router = APIRouter()


@router.post("/api/orders")
def create_order(req: CreateOrderReq, token: str):
    username = get_username_by_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="无效的token")
    if not req.items:
        raise HTTPException(status_code=400, detail="订单不能为空")

    conn = get_db()
    c = conn.cursor()
    td = today_str()
    dt = datetime.now()
    order_id = f"ORD{dt.strftime('%y%m%d%H%M%S')}{random.randint(1000, 9999)}"
    total_price = 0

    for idx, item in enumerate(req.items):
        price = item.price if isinstance(item.price, (int, float)) else 0
        sub = price * item.qty
        total_price += sub
        sub_order_id = f"{order_id}-{idx + 1}"
        c.execute(
            "INSERT INTO orders (order_id, customer_name, product_id, quantity, total_price, status, order_date) VALUES (%s, %s, %s, %s, %s, %s, %s)",
            (sub_order_id, username, item.product_id, item.qty, sub, "pending", td),
        )

    companies = ["顺丰速运", "中通快递", "圆通速递", "京东物流", "EMS"]
    company = random.choice(companies)
    try:
        c.execute(
            "INSERT INTO shipments (order_id, company, tracking_no, status, location, eta) VALUES (%s, %s, %s, %s, %s, %s)",
            (order_id, company, f"SF{order_id}", "pending", "待发货", td),
        )
    except Exception:
        pass

    conn.commit()
    conn.close()
    return {"code": 0, "data": {"order_id": order_id, "total_price": round(total_price, 2)}}
