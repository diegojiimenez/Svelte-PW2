import random
import time
from bson import ObjectId
from datetime import datetime

from app.repositories import cart_repository, order_repository



def _format_date(date: datetime) -> str:
    return date.strftime("%b %d, %Y")


def _format_money(amount: float) -> str:
    return f"${round(amount)}"


def _serialize_order(order: dict) -> dict:
    result = dict(order)
    result["_id"] = str(result["_id"])
    result["user"] = str(result["user"])
    if "createdAt" in result and isinstance(result["createdAt"], datetime):
        result["createdAt"] = result["createdAt"].isoformat()
    if "updatedAt" in result and isinstance(result["updatedAt"], datetime):
        result["updatedAt"] = result["updatedAt"].isoformat()
    items = []
    for item in result.get("items", []):
        item = dict(item)
        if "_id" in item:
            item["_id"] = str(item["_id"])
        if "product" in item:
            item["product"] = str(item["product"])
        items.append(item)
    result["items"] = items
    return result


def _to_admin_row(order: dict, user_doc: dict | None) -> dict:
    items = order.get("items", [])
    count = len(items)

    if count == 0:
        item_text = "(no items)"
    elif count == 1:
        item_text = items[0].get("name", "")
    else:
        item_text = f"{items[0].get('name', '')} +{count - 1} more"

    if user_doc:
        nombre = user_doc.get("nombre", "")
        apellido = user_doc.get("apellido", "")
        customer = f"{nombre} {apellido}".strip() or user_doc.get("email", "Unknown")
    else:
        customer = "Unknown"

    created_at = order.get("createdAt", datetime.utcnow())

    return {
        "id": order.get("orderNumber"),
        "customer": customer,
        "item": item_text,
        "date": _format_date(created_at),
        "total": _format_money(order.get("total", 0)),
        "status": order.get("status"),
    }


async def _generate_order_number() -> str:
    count = await order_repository.count()
    timestamp = str(int(time.time() * 1000))[-6:]
    random_part = str(random.randint(0, 999)).zfill(3)
    return f"ORD-{timestamp}-{random_part}-{count + 1}"


async def create_from_cart(user_id: str) -> dict:
    cart = await cart_repository.find_by_user(user_id)
    if not cart or not cart.get("items"):
        raise ValueError("El carrito está vacío")

    items = []
    for i in cart["items"]:
        subtotal = i["price"] * i["quantity"]
        items.append({
            "_id": ObjectId(),
            "product": i["product"],
            "name": i["name"],
            "image": i["image"],
            "imageAlt": i.get("imageAlt"),
            "quantity": i["quantity"],
            "size": i["size"],
            "color": i["color"],
            "priceUnit": i["price"],
            "subtotal": subtotal,
        })

    subtotal = sum(i["subtotal"] for i in items)
    tax = 0
    total = subtotal + tax
    now = datetime.utcnow()

    order_doc = {
        "user": ObjectId(user_id),
        "orderNumber": await _generate_order_number(),
        "items": items,
        "subtotal": subtotal,
        "tax": tax,
        "total": total,
        "status": "Placed",
        "createdAt": now,
        "updatedAt": now,
    }

    created = await order_repository.create(order_doc)
    await cart_repository.clear_items_by_user(user_id)
    return _serialize_order(created)


async def get_my_orders(user_id: str) -> list:
    orders = await order_repository.find_by_user(user_id)
    return [_serialize_order(o) for o in orders]


async def get_all_for_admin() -> list:
    orders = await order_repository.find_all_with_user()
    return [_to_admin_row(o, o.get("userDoc")) for o in orders]


async def update_status(order_number: str, status: str) -> dict:
    updated = await order_repository.update_status(order_number, status)
    if not updated:
        raise ValueError("Orden no encontrada")
    return _serialize_order(updated)
