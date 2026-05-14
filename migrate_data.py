"""将 shop.db (SQLite) 数据迁移到 Docker MySQL (端口 3307)"""
import sqlite3
import pymysql

DB_CONFIG = {
    "host": "localhost",
    "port": 3307,
    "user": "root",
    "password": "123456",
    "database": "2042_mall",
    "charset": "utf8mb4",
}

import os
sq = sqlite3.connect(os.path.join(os.path.dirname(__file__), "shop.db"))
my = pymysql.connect(**DB_CONFIG)
mc = my.cursor()

# 清理旧数据
mc.execute("DELETE FROM daily_stats")
mc.execute("DELETE FROM orders")
my.commit()

# daily_stats: id, date, total_orders, total_revenue, top_product, refund_count
rows = sq.execute("SELECT date, total_orders, total_revenue, top_product, refund_count FROM daily_stats ORDER BY date").fetchall()
print(f"daily_stats: {len(rows)} 条")
for r in rows:
    mc.execute(
        "INSERT INTO daily_stats (date, total_orders, total_revenue, top_product, refund_count) VALUES (%s, %s, %s, %s, %s)",
        (r[0], r[1], float(r[2]), r[3], r[4])
    )
my.commit()

# orders: id, order_id, user_name, product_name, quantity, amount, status, order_date
rows = sq.execute("SELECT order_id, user_name, product_name, quantity, amount, status, order_date FROM orders ORDER BY order_id").fetchall()
print(f"orders: {len(rows)} 条")
for r in rows:
    mc.execute(
        "INSERT INTO orders (order_id, customer_name, product_id, quantity, total_price, status, order_date) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (r[0], r[1], r[2], r[3], float(r[4]), r[5], r[6])
    )
my.commit()

sq.close()
my.close()
print("迁移完成!")
