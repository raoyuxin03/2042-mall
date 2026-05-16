"""数据库连接与初始化"""

import os
import pymysql

DB_CONFIG = {
    "host": os.getenv("MYSQL_HOST", "localhost"),
    "user": os.getenv("MYSQL_USER", "root"),
    "password": os.getenv("MYSQL_PASSWORD", "123456"),
    "database": os.getenv("MYSQL_DATABASE", "2042_mall"),
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor,
}


def get_db():
    return pymysql.connect(**DB_CONFIG)


def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            created_at DATETIME DEFAULT NOW()
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS tokens (
            token VARCHAR(100) PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            created_at DATETIME DEFAULT NOW()
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS cart (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL,
            product_id VARCHAR(20) NOT NULL,
            qty INT NOT NULL DEFAULT 1,
            UNIQUE KEY uk_cart (username, product_id)
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS daily_stats (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE UNIQUE NOT NULL,
            total_orders INT DEFAULT 0,
            total_revenue DECIMAL(12,2) DEFAULT 0,
            top_product VARCHAR(100) DEFAULT '',
            refund_count INT DEFAULT 0
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id VARCHAR(50) UNIQUE NOT NULL,
            customer_name VARCHAR(100) NOT NULL,
            product_id VARCHAR(20) NOT NULL,
            quantity INT DEFAULT 1,
            total_price DECIMAL(10,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'pending',
            order_date DATE NOT NULL
        )
    """)
    conn.commit()
    try:
        c.execute("ALTER TABLE shipments DROP FOREIGN KEY IF EXISTS shipments_ibfk_1")
    except Exception:
        pass
    conn.close()
