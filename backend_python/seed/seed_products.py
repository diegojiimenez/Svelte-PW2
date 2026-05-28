"""Seed de productos: limpia la colección e inserta desde products.seed.json."""

import asyncio
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from motor.motor_asyncio import AsyncIOMotorClient


async def run() -> None:
    uri = os.getenv("MONGODB_URI")
    if not uri:
        raise ValueError("MONGODB_URI no está definido en .env")

    db_name = uri.split("/")[-1].split("?")[0]
    client = AsyncIOMotorClient(uri)
    db = client[db_name]

    seed_file = Path(__file__).parent / "products.seed.json"
    with open(seed_file, encoding="utf-8") as f:
        products = json.load(f)

    docs = [{k: v for k, v in p.items() if k != "id"} for p in products]

    await db.products.delete_many({})
    print("Productos borrados")

    result = await db.products.insert_many(docs)
    print(f"Productos insertados: {len(result.inserted_ids)}")

    client.close()
    print("Listo. Desconectado.")


if __name__ == "__main__":
    asyncio.run(run())
