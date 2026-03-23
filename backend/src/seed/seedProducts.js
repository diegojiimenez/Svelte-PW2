require("dotenv").config();
const mongoose = require("mongoose");

const Product = require("../models/Product");
const seedProducts = require("./products.seed.json");

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI no está definido");

  await mongoose.connect(uri);
  console.log("MongoDB conectado:", mongoose.connection.name);

  // 1) Limpia productos (opcional pero recomendado para que sea idempotente)
  await Product.deleteMany({});
  console.log("Productos borrados");

  // 2) Insertar (ignoramos el campo 'id' del JSON porque Mongo usa _id)
  const docsToInsert = seedProducts.map((p) => {
    const { id, ...rest } = p;
    return rest;
  });

  const inserted = await Product.insertMany(docsToInsert);
  console.log(`Productos insertados: ${inserted.length}`);

  await mongoose.disconnect();
  console.log("Listo. Desconectado.");
}

run().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});