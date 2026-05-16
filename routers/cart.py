"""购物车 API"""

from fastapi import APIRouter, HTTPException
from database import get_db
from routers.auth import get_username_by_token
from models import CartSyncReq

router = APIRouter()


@router.get("/api/cart")
def get_cart(token: str):
    username = get_username_by_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="无效的token")
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT product_id, qty FROM cart WHERE username=%s", (username,))
    rows = c.fetchall()
    conn.close()
    return {"code": 0, "data": [{"product_id": r["product_id"], "qty": r["qty"]} for r in rows]}


@router.post("/api/cart/sync")
def sync_cart(req: CartSyncReq, token: str):
    username = get_username_by_token(token)
    if not username:
        raise HTTPException(status_code=401, detail="无效的token")
    conn = get_db()
    c = conn.cursor()
    c.execute("DELETE FROM cart WHERE username=%s", (username,))
    for item in req.items:
        if item.qty > 0:
            c.execute("INSERT INTO cart (username, product_id, qty) VALUES (%s, %s, %s)", (username, item.product_id, item.qty))
    conn.commit()
    conn.close()
    return {"code": 0, "msg": "同步成功"}
