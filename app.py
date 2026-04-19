from __future__ import annotations

import csv
import io
import os
import re
import sqlite3
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from flask import Flask, Response, jsonify, request, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = Path(os.getenv("GROUP_ORDER_DB_PATH", str(BASE_DIR / "group_orders.db")))

app = Flask(__name__, static_folder="static", static_url_path="/static")

DEFAULT_STORE_NAME = "双椒鲜土锅馆"


MENU_SEED = [
    {"name": "爆炒肥肠", "price": 46, "category": "招牌必点"},
    {"name": "九秒腰花", "price": 31, "category": "招牌必点"},
    {"name": "鹿茸菌炒回锅肉", "price": 39, "category": "招牌必点"},
    {"name": "石锅红烧肉", "price": 39, "category": "招牌必点"},
    {"name": "酸萝卜爆牛肚", "price": 39, "category": "招牌必点"},
    {"name": "紫苏鲜鱼杂", "price": 39, "category": "招牌必点"},
    {"name": "芋头炒腊肉", "price": 39, "category": "招牌必点"},
    {"name": "酸姜鸡杂", "price": 32, "category": "招牌必点"},
    {"name": "小炒格格肝肉", "price": 39, "category": "招牌必点"},
    {"name": "麻辣小龙虾", "price": 39, "category": "招牌必点"},
    {"name": "小黄姜炒鸡", "price": 39, "category": "招牌必点"},
    {"name": "紫苏牛蛙", "price": 39, "category": "招牌必点"},
    {"name": "脆皮辣子鸡", "price": 39, "category": "招牌必点"},
    {"name": "辣椒炒肉", "price": 35, "category": "招牌必点"},
    {"name": "梅干菜凤爪", "price": 39, "category": "新品上市"},
    {"name": "猪头肉炒饼粑", "price": 29, "category": "新品上市"},
    {"name": "发辣香干丝", "price": 19, "category": "新品上市"},
    {"name": "豆芽菜炒鸡蛋", "price": 18, "category": "新品上市"},
    {"name": "蒜苔香豆", "price": 9, "category": "新品上市"},
    {"name": "煲炒猪肝", "price": 28, "category": "家常小炒"},
    {"name": "臭豆腐砂锅", "price": 28, "category": "家常小炒"},
    {"name": "砂锅啤汤烩", "price": 26, "category": "家常小炒"},
    {"name": "坛剁椒脆肝", "price": 23, "category": "家常小炒"},
    {"name": "梅菜炒茄子", "price": 22, "category": "家常小炒"},
    {"name": "肉末笋丝", "price": 22, "category": "家常小炒"},
    {"name": "酸菜炒粉皮", "price": 22, "category": "家常小炒"},
    {"name": "油渣炒洪菜", "price": 19, "category": "家常小炒"},
    {"name": "榨菜肉末豆角", "price": 19, "category": "家常小炒"},
    {"name": "冷辣臭豆腐", "price": 16, "category": "家常小炒"},
    {"name": "酒炒土鸡蛋", "price": 23, "category": "家常小炒"},
    {"name": "带汤臭豆腐", "price": 19, "category": "家常小炒"},
    {"name": "下饭一碗香", "price": 18, "category": "家常小炒"},
    {"name": "酱油土豆丝", "price": 16, "category": "家常小炒"},
    {"name": "油爆小八爪", "price": 16, "category": "家常小炒"},
    {"name": "带皮猪肝汤", "price": 16, "category": "家常小炒"},
    {"name": "豆腐菌菇双汤", "price": 16, "category": "家常小炒"},
    {"name": "麻婆豆腐", "price": 9, "category": "凉菜配菜"},
    {"name": "五香花生米", "price": 8, "category": "凉菜配菜"},
    {"name": "刀拍黄瓜", "price": 15, "category": "凉菜配菜"},
]


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def now_iso() -> str:
    return datetime.now().replace(microsecond=0).isoformat(sep=" ")


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS menu_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                price INTEGER NOT NULL,
                category TEXT NOT NULL,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                member_name TEXT NOT NULL,
                contact TEXT NOT NULL DEFAULT '',
                remark TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                menu_item_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price INTEGER NOT NULL,
                FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY(menu_item_id) REFERENCES menu_items(id),
                UNIQUE(order_id, menu_item_id)
            );
            """
        )

        existing_count = conn.execute("SELECT COUNT(*) AS c FROM menu_items").fetchone()["c"]
        if existing_count == 0:
            stamp = now_iso()
            conn.executemany(
                """
                INSERT INTO menu_items(name, price, category, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                [(item["name"], item["price"], item["category"], stamp, stamp) for item in MENU_SEED],
            )

        store_name_row = conn.execute("SELECT value FROM app_settings WHERE key = 'store_name'").fetchone()
        if store_name_row is None:
            conn.execute(
                "INSERT INTO app_settings(key, value, updated_at) VALUES ('store_name', ?, ?)",
                (DEFAULT_STORE_NAME, now_iso()),
            )


def get_setting(conn: sqlite3.Connection, key: str, default: str = "") -> str:
    row = conn.execute("SELECT value FROM app_settings WHERE key = ?", (key,)).fetchone()
    if row is None:
        return default
    return str(row["value"])


def upsert_setting(conn: sqlite3.Connection, key: str, value: str) -> None:
    conn.execute(
        """
        INSERT INTO app_settings(key, value, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        """,
        (key, value, now_iso()),
    )


def fetch_settings(conn: sqlite3.Connection) -> dict:
    return {
        "store_name": get_setting(conn, "store_name", DEFAULT_STORE_NAME),
    }


def parse_menu_import_text(raw_text: str) -> list[dict]:
    rows = [line.strip() for line in raw_text.splitlines() if line.strip()]
    if not rows:
        raise ValueError("导入内容不能为空")

    parsed: list[dict] = []
    line_error = "每行请使用：分类,菜名,价格 或 菜名,价格,分类"

    for index, line in enumerate(rows, start=1):
        parts = [part.strip() for part in re.split(r"[\t,，]+", line) if part.strip()]
        name = ""
        category = ""
        price_raw = ""

        if len(parts) == 3:
            if re.fullmatch(r"\d+", parts[1]):
                name, price_raw, category = parts[0], parts[1], parts[2]
            elif re.fullmatch(r"\d+", parts[2]):
                category, name, price_raw = parts[0], parts[1], parts[2]
            else:
                raise ValueError(f"第 {index} 行格式错误：{line_error}")
        else:
            match = re.fullmatch(r"(.+?)\s+(\d+)$", line)
            if not match:
                raise ValueError(f"第 {index} 行格式错误：{line_error}")
            name, price_raw = match.group(1).strip(), match.group(2).strip()
            category = "未分类"

        name = name.strip()
        category = category.strip()
        if not name:
            raise ValueError(f"第 {index} 行菜名为空")
        if not category:
            raise ValueError(f"第 {index} 行分类为空")

        try:
            price = parse_price(price_raw)
        except ValueError as exc:
            raise ValueError(f"第 {index} 行价格错误：{exc}") from None

        parsed.append({"name": name, "category": category, "price": price})

    deduped: dict[str, dict] = {}
    for item in parsed:
        deduped[item["name"]] = item
    return list(deduped.values())


def normalize_items(raw_items: list[dict]) -> list[dict]:
    if not raw_items:
        return []

    merged: dict[int, int] = defaultdict(int)
    for raw in raw_items:
        try:
            menu_item_id = int(raw.get("menu_item_id", 0))
            quantity = int(raw.get("quantity", 0))
        except (TypeError, ValueError):
            continue

        if menu_item_id <= 0 or quantity <= 0:
            continue

        merged[menu_item_id] += quantity

    return [{"menu_item_id": item_id, "quantity": qty} for item_id, qty in merged.items() if qty > 0]


def fetch_order(conn: sqlite3.Connection, order_id: int) -> dict | None:
    rows = conn.execute(
        """
        SELECT
            o.id AS order_id,
            o.member_name,
            o.contact,
            o.remark,
            o.created_at,
            o.updated_at,
            oi.menu_item_id,
            oi.quantity,
            oi.unit_price,
            m.name AS item_name,
            m.category AS item_category
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        LEFT JOIN menu_items m ON m.id = oi.menu_item_id
        WHERE o.id = ?
        ORDER BY oi.id ASC
        """,
        (order_id,),
    ).fetchall()

    if not rows:
        return None

    first = rows[0]
    items = []
    total_amount = 0
    total_count = 0

    for row in rows:
        if row["menu_item_id"] is None:
            continue
        subtotal = row["quantity"] * row["unit_price"]
        items.append(
            {
                "menu_item_id": row["menu_item_id"],
                "name": row["item_name"],
                "category": row["item_category"],
                "quantity": row["quantity"],
                "unit_price": row["unit_price"],
                "subtotal": subtotal,
            }
        )
        total_amount += subtotal
        total_count += row["quantity"]

    return {
        "id": first["order_id"],
        "member_name": first["member_name"],
        "contact": first["contact"],
        "remark": first["remark"],
        "created_at": first["created_at"],
        "updated_at": first["updated_at"],
        "total_amount": total_amount,
        "total_count": total_count,
        "items": items,
    }


def fetch_all_orders(conn: sqlite3.Connection) -> list[dict]:
    ids = conn.execute("SELECT id FROM orders ORDER BY updated_at DESC, id DESC").fetchall()
    orders = []
    for row in ids:
        order = fetch_order(conn, row["id"])
        if order is not None:
            orders.append(order)
    return orders


def fetch_summary(conn: sqlite3.Connection) -> dict:
    total = conn.execute(
        """
        SELECT
            COUNT(DISTINCT o.id) AS order_count,
            COALESCE(SUM(oi.quantity), 0) AS item_count,
            COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS amount
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        """
    ).fetchone()

    dish_rows = conn.execute(
        """
        SELECT
            m.name,
            m.category,
            SUM(oi.quantity) AS quantity,
            SUM(oi.quantity * oi.unit_price) AS amount
        FROM order_items oi
        JOIN menu_items m ON m.id = oi.menu_item_id
        GROUP BY oi.menu_item_id
        ORDER BY quantity DESC, amount DESC
        """
    ).fetchall()

    member_rows = conn.execute(
        """
        SELECT
            o.member_name,
            COUNT(oi.id) AS dish_type_count,
            COALESCE(SUM(oi.quantity), 0) AS item_count,
            COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS amount
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        GROUP BY o.id
        ORDER BY amount DESC, item_count DESC
        """
    ).fetchall()

    return {
        "overview": {
            "order_count": total["order_count"],
            "item_count": total["item_count"],
            "amount": total["amount"],
        },
        "dish_rank": [dict(row) for row in dish_rows],
        "member_rank": [dict(row) for row in member_rows],
    }


def fetch_menu_admin(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        """
        SELECT id, name, price, category, is_active, updated_at
        FROM menu_items
        ORDER BY is_active DESC, category ASC, name ASC, id ASC
        """
    ).fetchall()
    return [dict(row) for row in rows]


def parse_price(raw_price: object) -> int:
    try:
        price = int(raw_price)
    except (TypeError, ValueError):
        raise ValueError("价格必须是整数") from None
    if price <= 0:
        raise ValueError("价格必须大于 0")
    return price


@app.get("/")
def index() -> Response:
    return send_from_directory(app.static_folder, "index.html")


@app.get("/api/menu")
def api_menu() -> Response:
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, name, price, category
            FROM menu_items
            WHERE is_active = 1
            ORDER BY category ASC, price DESC, id ASC
            """
        ).fetchall()

    return jsonify([dict(row) for row in rows])


@app.get("/api/settings")
def api_settings() -> Response:
    with get_conn() as conn:
        settings = fetch_settings(conn)
    return jsonify(settings)


@app.put("/api/settings/store-name")
def api_update_store_name() -> Response:
    payload = request.get_json(silent=True) or {}
    store_name = str(payload.get("store_name", "")).strip()
    if not store_name:
        return jsonify({"error": "店铺名称不能为空"}), 400

    with get_conn() as conn:
        upsert_setting(conn, "store_name", store_name)
        settings = fetch_settings(conn)
    return jsonify(settings)


@app.get("/api/menu/admin")
def api_menu_admin() -> Response:
    with get_conn() as conn:
        items = fetch_menu_admin(conn)
    return jsonify(items)


@app.post("/api/menu")
def api_menu_create() -> Response:
    payload = request.get_json(silent=True) or {}
    name = str(payload.get("name", "")).strip()
    category = str(payload.get("category", "")).strip()
    if not name:
        return jsonify({"error": "菜名不能为空"}), 400
    if not category:
        return jsonify({"error": "分类不能为空"}), 400
    try:
        price = parse_price(payload.get("price"))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    stamp = now_iso()
    with get_conn() as conn:
        existing = conn.execute("SELECT id, is_active FROM menu_items WHERE name = ?", (name,)).fetchone()
        if existing and existing["is_active"] == 1:
            return jsonify({"error": "菜名已存在"}), 400

        if existing and existing["is_active"] == 0:
            conn.execute(
                """
                UPDATE menu_items
                SET category = ?, price = ?, is_active = 1, updated_at = ?
                WHERE id = ?
                """,
                (category, price, stamp, existing["id"]),
            )
        else:
            conn.execute(
                """
                INSERT INTO menu_items(name, price, category, is_active, created_at, updated_at)
                VALUES (?, ?, ?, 1, ?, ?)
                """,
                (name, price, category, stamp, stamp),
            )

        created = conn.execute(
            "SELECT id, name, price, category, is_active, updated_at FROM menu_items WHERE name = ?", (name,)
        ).fetchone()
    return jsonify(dict(created)), 201


@app.patch("/api/menu/<int:menu_item_id>/price")
def api_menu_update_price(menu_item_id: int) -> Response:
    payload = request.get_json(silent=True) or {}
    try:
        price = parse_price(payload.get("price"))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    stamp = now_iso()
    with get_conn() as conn:
        exists = conn.execute("SELECT id FROM menu_items WHERE id = ?", (menu_item_id,)).fetchone()
        if not exists:
            return jsonify({"error": "菜品不存在"}), 404
        conn.execute("UPDATE menu_items SET price = ?, updated_at = ? WHERE id = ?", (price, stamp, menu_item_id))
        updated = conn.execute(
            "SELECT id, name, price, category, is_active, updated_at FROM menu_items WHERE id = ?", (menu_item_id,)
        ).fetchone()
    return jsonify(dict(updated))


@app.delete("/api/menu/<int:menu_item_id>")
def api_menu_delete(menu_item_id: int) -> Response:
    stamp = now_iso()
    with get_conn() as conn:
        exists = conn.execute("SELECT id FROM menu_items WHERE id = ?", (menu_item_id,)).fetchone()
        if not exists:
            return jsonify({"error": "菜品不存在"}), 404
        conn.execute("UPDATE menu_items SET is_active = 0, updated_at = ? WHERE id = ?", (stamp, menu_item_id))
    return jsonify({"ok": True})


@app.post("/api/menu/import")
def api_menu_import() -> Response:
    payload = request.get_json(silent=True) or {}
    raw_text = str(payload.get("content", ""))
    replace_all = bool(payload.get("replace_all", False))

    try:
        parsed = parse_menu_import_text(raw_text)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    stamp = now_iso()
    with get_conn() as conn:
        if replace_all:
            conn.execute("UPDATE menu_items SET is_active = 0, updated_at = ?", (stamp,))

        added = 0
        updated = 0
        restored = 0

        for item in parsed:
            existing = conn.execute(
                "SELECT id, is_active FROM menu_items WHERE name = ?", (item["name"],)
            ).fetchone()
            if existing is None:
                conn.execute(
                    """
                    INSERT INTO menu_items(name, price, category, is_active, created_at, updated_at)
                    VALUES (?, ?, ?, 1, ?, ?)
                    """,
                    (item["name"], item["price"], item["category"], stamp, stamp),
                )
                added += 1
                continue

            conn.execute(
                """
                UPDATE menu_items
                SET category = ?, price = ?, is_active = 1, updated_at = ?
                WHERE id = ?
                """,
                (item["category"], item["price"], stamp, existing["id"]),
            )
            if existing["is_active"] == 0:
                restored += 1
            else:
                updated += 1

        active_count = conn.execute("SELECT COUNT(*) AS c FROM menu_items WHERE is_active = 1").fetchone()["c"]

    return jsonify(
        {
            "ok": True,
            "summary": {
                "imported_count": len(parsed),
                "added": added,
                "updated": updated,
                "restored": restored,
                "active_count": active_count,
                "replace_all": replace_all,
            },
        }
    )


@app.get("/api/orders")
def api_orders() -> Response:
    with get_conn() as conn:
        orders = fetch_all_orders(conn)
    return jsonify(orders)


def validate_payload(payload: dict) -> tuple[str | None, list[dict]]:
    member_name = str(payload.get("member_name", "")).strip()
    if not member_name:
        return "成员姓名不能为空", []

    items = normalize_items(payload.get("items", []))
    if not items:
        return "请至少选择一道菜", []

    return None, items


def write_order(conn: sqlite3.Connection, order_id: int | None, payload: dict, items: list[dict]) -> int:
    member_name = str(payload.get("member_name", "")).strip()
    contact = str(payload.get("contact", "")).strip()
    remark = str(payload.get("remark", "")).strip()
    stamp = now_iso()

    if order_id is None:
        cursor = conn.execute(
            """
            INSERT INTO orders(member_name, contact, remark, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (member_name, contact, remark, stamp, stamp),
        )
        order_id = cursor.lastrowid
    else:
        conn.execute(
            """
            UPDATE orders
            SET member_name = ?, contact = ?, remark = ?, updated_at = ?
            WHERE id = ?
            """,
            (member_name, contact, remark, stamp, order_id),
        )
        conn.execute("DELETE FROM order_items WHERE order_id = ?", (order_id,))

    menu_map = {
        row["id"]: row["price"]
        for row in conn.execute(
            "SELECT id, price FROM menu_items WHERE is_active = 1 AND id IN ({})".format(
                ",".join("?" * len(items))
            ),
            tuple(item["menu_item_id"] for item in items),
        ).fetchall()
    }

    insert_data = []
    for item in items:
        item_id = item["menu_item_id"]
        if item_id not in menu_map:
            continue
        insert_data.append((order_id, item_id, item["quantity"], menu_map[item_id]))

    if not insert_data:
        raise ValueError("所选菜品无效或已下架")

    conn.executemany(
        """
        INSERT INTO order_items(order_id, menu_item_id, quantity, unit_price)
        VALUES (?, ?, ?, ?)
        """,
        insert_data,
    )

    conn.execute("UPDATE orders SET updated_at = ? WHERE id = ?", (stamp, order_id))
    return order_id


@app.post("/api/orders")
def api_create_order() -> Response:
    payload = request.get_json(silent=True) or {}
    error, items = validate_payload(payload)
    if error:
        return jsonify({"error": error}), 400

    with get_conn() as conn:
        try:
            order_id = write_order(conn, None, payload, items)
            order = fetch_order(conn, order_id)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    return jsonify(order), 201


@app.put("/api/orders/<int:order_id>")
def api_update_order(order_id: int) -> Response:
    payload = request.get_json(silent=True) or {}
    error, items = validate_payload(payload)
    if error:
        return jsonify({"error": error}), 400

    with get_conn() as conn:
        exists = conn.execute("SELECT id FROM orders WHERE id = ?", (order_id,)).fetchone()
        if not exists:
            return jsonify({"error": "订单不存在"}), 404
        try:
            write_order(conn, order_id, payload, items)
            order = fetch_order(conn, order_id)
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    return jsonify(order)


@app.delete("/api/orders/<int:order_id>")
def api_delete_order(order_id: int) -> Response:
    with get_conn() as conn:
        deleted = conn.execute("DELETE FROM orders WHERE id = ?", (order_id,)).rowcount
    if deleted == 0:
        return jsonify({"error": "订单不存在"}), 404
    return jsonify({"ok": True})


@app.get("/api/summary")
def api_summary() -> Response:
    with get_conn() as conn:
        summary = fetch_summary(conn)
    return jsonify(summary)


@app.get("/api/export.csv")
def api_export_csv() -> Response:
    with get_conn() as conn:
        orders = fetch_all_orders(conn)
        summary = fetch_summary(conn)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["群下单导出", now_iso()])
    writer.writerow([])
    writer.writerow(["成员", "联系方式", "菜品", "单价", "数量", "小计", "备注"])

    for order in orders:
        first = True
        for item in order["items"]:
            writer.writerow(
                [
                    order["member_name"] if first else "",
                    order["contact"] if first else "",
                    item["name"],
                    item["unit_price"],
                    item["quantity"],
                    item["subtotal"],
                    order["remark"] if first else "",
                ]
            )
            first = False
        if not order["items"]:
            writer.writerow([order["member_name"], order["contact"], "", "", "", "", order["remark"]])

    writer.writerow([])
    writer.writerow(["总订单数", summary["overview"]["order_count"]])
    writer.writerow(["总份数", summary["overview"]["item_count"]])
    writer.writerow(["总金额", summary["overview"]["amount"]])

    csv_text = output.getvalue()
    output.close()

    return Response(
        csv_text,
        mimetype="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=group-orders.csv"},
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)


init_db()
