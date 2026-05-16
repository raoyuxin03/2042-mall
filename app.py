"""
小饶的虚拟科技百货 - 后端API入口
FastAPI + MySQL，提供注册登录、商品列表、购物车、下单、后台数据接口
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import init_db
from data import PRODUCTS
from routers import auth, cart, orders, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="虚拟科技百货 API", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(__file__)
STATIC_DIR = os.path.join(BASE_DIR, "static")

# 注册路由
app.include_router(auth.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(admin.router)


@app.get("/api/products")
def get_products():
    return {"code": 0, "data": PRODUCTS}


@app.get("/")
def serve_root():
    idx = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(idx):
        return FileResponse(idx)
    return {"msg": "虚拟科技百货 API 运行中"}


@app.get("/admin.html")
def serve_admin():
    idx = os.path.join(STATIC_DIR, "admin.html")
    if os.path.isfile(idx):
        return FileResponse(idx)
    return {"detail": "Not Found"}


if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=STATIC_DIR), name="assets")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8001, reload=False)
