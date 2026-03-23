require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomHex() {
  const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  return `#${hex}`;
}

const categories = ["Tops", "Bottoms", "Outerwear", "Accessories", "Shoes"];
const statuses = ["active", "active", "active", "inactive"]; // mayoría active para que se vean en shop

const sizesByCategory = {
  Tops: ["XS", "S", "M", "L", "XL", "XXL"],
  Bottoms: ["28", "30", "32", "34", "36"],
  Outerwear: ["S", "M", "L", "XL"],
  Accessories: ["One Size"],
  Shoes: ["7", "8", "9", "10", "11"],
};

const adjectives = ["Obsidian", "Void", "Shadow", "Archive", "Minimal", "Brutalist", "Monolith", "Eclipse", "Noir", "Apex"];
const nouns = ["Tee", "Hoodie", "Jacket", "Cargo Pants", "Coat", "Bomber", "Tank Top", "Track Pants", "Cap", "Boots"];

const unsplashQueriesByCategory = {
  Tops: ["tshirt", "hoodie", "streetwear top"],
  Bottoms: ["cargo pants", "pants fashion", "streetwear pants"],
  Outerwear: ["jacket fashion", "coat fashion", "leather jacket"],
  Accessories: ["cap fashion", "bag fashion", "accessories fashion"],
  Shoes: ["boots fashion", "sneakers fashion", "shoes fashion"],
};

function unsplashUrl(width, height, query) {
  // Usamos sig (signature) para variar resultados de manera determinista-ish
  const sig = randInt(1, 1000000);
  const q = encodeURIComponent(query);
  return `https://source.unsplash.com/${width}x${height}/?${q}&sig=${sig}`;
}

function makeProduct(i) {
  const category = pick(categories);
  const name = `${pick(adjectives)} ${pick(nouns)} #${i}`;
  const price = randInt(90, 1400);

  const query1 = pick(unsplashQueriesByCategory[category] || ["fashion"]);
  const query2 = pick(unsplashQueriesByCategory[category] || ["fashion"]);

  const image = unsplashUrl(800, 1000, query1);
  const imageAlt = unsplashUrl(800, 1000, query2);

  const colorsCount = randInt(1, 4);
  const colors = Array.from({ length: colorsCount }).map((_, idx) => ({
    name: `Color ${idx + 1}`,
    hex: randomHex(),
  }));

  const sizes = sizesByCategory[category] || ["One Size"];

  return {
    name,
    price,
    status: pick(statuses),
    category,
    image,
    imageAlt,
    colors,
    sizes,
    description: `Producto generado automáticamente (${category}). ${name}.`,
    quantity: randInt(1, 30),
  };
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI no está definido");

  await mongoose.connect(uri);
  console.log("MongoDB conectado:", mongoose.connection.name);

  const docs = Array.from({ length: 30 }).map((_, idx) => makeProduct(idx + 1));
  const inserted = await Product.insertMany(docs);

  console.log(`Productos fake insertados: ${inserted.length}`);
  await mongoose.disconnect();
  console.log("Listo. Desconectado.");
}

run().catch(async (err) => {
  console.error(err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});