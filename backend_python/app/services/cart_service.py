from bson import ObjectId
from datetime import datetime

from app.repositories import cart_repository, product_repository


def _serialize_item(item: dict) -> dict:
    result = {
        "_id": str(item["_id"]),
        "product": str(item["product"]),
        "name": item.get("name"),
        "price": item.get("price"),
        "image": item.get("image"),
        "imageAlt": item.get("imageAlt"),
        "color": item.get("color"),
        "size": item.get("size"),
        "quantity": item.get("quantity"),
    }
    return result


def _serialize_cart(cart: dict) -> dict:
    items = [_serialize_item(i) for i in cart.get("items", [])]
    subtotal = sum(i["price"] * i["quantity"] for i in items if i.get("price") and i.get("quantity"))
    return {
        "_id": str(cart["_id"]),
        "user": str(cart["user"]),
        "items": items,
        "subtotal": subtotal,
    }


async def _get_or_create(user_id: str) -> dict:
    cart = await cart_repository.find_by_user(user_id)
    if not cart:
        cart = await cart_repository.create_for_user(user_id)
    return cart


async def get_my_cart(user_id: str) -> dict:
    return _serialize_cart(await _get_or_create(user_id))


async def add_item(user_id: str, product_id: str, quantity: int, size: str, color: dict) -> dict:
    if quantity < 1:
        raise ValueError("quantity debe ser >= 1")

    product = await product_repository.find_by_id(product_id)
    if not product:
        raise ValueError("Producto no encontrado")

    cart = await _get_or_create(user_id)
    items = list(cart.get("items", []))

    existing_idx = next(
        (
            i for i, item in enumerate(items)
            if str(item.get("product")) == product_id
            and item.get("size") == size
            and item.get("color", {}).get("hex", "").lower() == color["hex"].lower()
        ),
        None,
    )

    if existing_idx is not None:
        items[existing_idx]["quantity"] += quantity
    else:
        items.append({
            "_id": ObjectId(),
            "product": ObjectId(product_id),
            "name": product["name"],
            "price": product["price"],
            "image": product["image"],
            "imageAlt": product.get("imageAlt"),
            "color": {"name": color["name"], "hex": color["hex"]},
            "size": size,
            "quantity": quantity,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        })

    updated = await cart_repository.save_items(str(cart["_id"]), items)
    return _serialize_cart(updated)


async def update_item_quantity(user_id: str, item_id: str, quantity: int) -> dict:
    if quantity < 1:
        raise ValueError("quantity debe ser >= 1")

    cart = await _get_or_create(user_id)
    items = list(cart.get("items", []))

    idx = next((i for i, item in enumerate(items) if str(item.get("_id")) == item_id), None)
    if idx is None:
        raise LookupError("Item no encontrado")

    items[idx]["quantity"] = quantity
    updated = await cart_repository.save_items(str(cart["_id"]), items)
    return _serialize_cart(updated)


async def remove_item(user_id: str, item_id: str) -> dict:
    cart = await _get_or_create(user_id)
    items = list(cart.get("items", []))
    new_items = [item for item in items if str(item.get("_id")) != item_id]

    if len(new_items) == len(items):
        raise LookupError("Item no encontrado")

    updated = await cart_repository.save_items(str(cart["_id"]), new_items)
    return _serialize_cart(updated)


async def clear_cart(user_id: str) -> dict:
    cart = await _get_or_create(user_id)
    updated = await cart_repository.save_items(str(cart["_id"]), [])
    return _serialize_cart(updated)
