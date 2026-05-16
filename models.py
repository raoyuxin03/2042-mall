"""Pydantic 请求模型"""

from pydantic import BaseModel


class RegisterReq(BaseModel):
    username: str
    password: str


class LoginReq(BaseModel):
    username: str
    password: str


class CartItem(BaseModel):
    product_id: str
    qty: int


class CartSyncReq(BaseModel):
    items: list[CartItem]


class OrderItem(BaseModel):
    product_id: str
    qty: int
    price: float | str


class CreateOrderReq(BaseModel):
    items: list[OrderItem]
