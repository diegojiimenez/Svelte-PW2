require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/Product");

// --- CONFIGURACIÓN DE DATOS CURADOS Y SEGUROS ---

// Definimos un catálogo estático pero realista para garantizar la calidad.
const categories = ["Tops", "Bottoms", "Outerwear", "Accessories", "Shoes"];

const curatedFashionData = {
  Tops: {
    products: [
      { name: "Raw Cotton Crew-neck", desc: "A classic cotton tee, simple and durable for everyday use." },
      { name: "Graphic Hoodie", desc: "A cozy hoodie with a clean, modern graphic print." },
      { name: "Ribbed Tank Top", desc: "A fitted, breathable tank top, perfect for layering." },
    ],
    // URLs de imágenes reales y curadas de la web (de temática de moda y seguras)
    images: [
      "https://images.pexels.com/photos/1566412/pexels-photo-1566412.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // T-shirt
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Hoodie
      "https://images.pexels.com/photos/2085354/pexels-photo-2085354.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Tank top
    ]
  },
  Bottoms: {
    products: [
      { name: "Raw Denim Jeans", desc: "A robust pair of raw denim jeans, built to last." },
      { name: "Technical Cargo Pants", desc: "Water-resistant pants with multiple utility pockets." },
      { name: "Linen Drawstring Shorts", desc: "A light, breathable pair of shorts for warm weather." },
    ],
    images: [
      "https://images.pexels.com/photos/1036856/pexels-photo-1036856.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Jeans
      "https://images.pexels.com/photos/3389531/pexels-photo-3389531.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Cargo pants
      "https://images.pexels.com/photos/1082528/pexels-photo-1082528.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Shorts
    ]
  },
  Outerwear: {
    products: [
      { name: "Puffer Jacket", desc: "A warm and lightweight puffer jacket for cold days." },
      { name: "Wool Overcoat", desc: "A sophisticated wool overcoat, suitable for formal wear." },
      { name: "Harrington Jacket", desc: "A classic Harrington style jacket, perfect for spring/fall." },
    ],
    images: [
      "https://images.pexels.com/photos/1617112/pexels-photo-1617112.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Jacket
      "https://images.pexels.com/photos/837129/pexels-photo-837129.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Overcoat
      "https://images.pexels.com/photos/740398/pexels-photo-740398.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Harrington
    ]
  },
  Accessories: {
    products: [
      { name: "Classic Steel Watch", desc: "A minimalist stainless steel watch, suitable for any outfit." },
      { name: "Leather Tote Bag", desc: "A durable and spacious leather tote bag for work or travel." },
      { name: "Trucker Hat", desc: "A simple, classic trucker hat for casual wear." },
    ],
    images: [
      "https://images.pexels.com/photos/167706/pexels-photo-167706.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Watch
      "https://images.pexels.com/photos/1111666/pexels-photo-1111666.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Tote
      "https://images.pexels.com/photos/1878821/pexels-photo-1878821.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Hat
    ]
  },
  Shoes: {
    products: [
      { name: "Low-top Sneakers", desc: "A versatile pair of classic low-top sneakers." },
      { name: "Chukka Boots", desc: "A simple, ankle-height boot, comfortable for daily wear." },
      { name: "Leather Loafers", desc: "A refined pair of leather loafers for formal occasions." },
    ],
    images: [
      "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Sneakers
      "https://images.pexels.com/photos/1908191/pexels-photo-1908191.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Chukka
      "https://images.pexels.com/photos/3321516/pexels-photo-3321516.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260", // Loafers
    ]
  }
};

const realColors = [
  { name: "Charcoal", hex: "#36454F" },
  { name: "Midnight Blue", hex: "#191970" },
  { name: "Sage Green", hex: "#87A96B" },
  { name: "Sand", hex: "#C2B280" },
  { name: "Black", hex: "#000000" },
];

const sizesByCategory = {
  Tops: ["XS", "S", "M", "L", "XL", "XXL"],
  Bottoms: ["28", "30", "32", "34", "36", "38"],
  Outerwear: ["S", "M", "L", "XL", "XXL"],
  Accessories: ["One Size"],
  Shoes: ["7", "8", "9", "10", "11", "12"],
};

// --- FUNCIONES DE UTILIDAD ---

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Función que elige una imagen curada para la categoría
function getCuratedImage(category) {
  return pick(curatedFashionData[category].images);
}

function makeProduct(i) {
  const category = pick(categories);
  const data = curatedFashionData[category];
  
  // Elegimos un producto curado para el nombre y descripción
  const productData = pick(data.products);
  const name = `${productData.name} #${i}`; // Añadimos el número para distinguir
  const price = randInt(25, 300); // Precios realistas

  // Colores reales
  const colorsCount = randInt(1, 3);
  const selectedColors = [];
  const colorPool = [...realColors];
  for(let j=0; j<colorsCount; j++) {
    const idx = Math.floor(Math.random() * colorPool.length);
    selectedColors.push(colorPool.splice(idx, 1)[0]);
  }

  // Obtenemos una imagen curada y segura
  const image = getCuratedImage(category);
  // Para imageAlt, obtenemos otra imagen de la misma categoría
  let imageAlt = getCuratedImage(category);
  // Aseguramos que las dos imágenes sean diferentes si hay más de una disponible
  if(data.images.length > 1) {
    while(imageAlt === image) {
      imageAlt = getCuratedImage(category);
    }
  }

  return {
    name,
    price,
    status: Math.random() > 0.05 ? "active" : "inactive", // Muy poca probabilidad de inactivo
    category,
    image,
    imageAlt,
    colors: selectedColors,
    sizes: sizesByCategory[category] || ["One Size"],
    description: `Este ${productData.name} de la colección curada destaca por su versatilidad. ${productData.desc}`,
    quantity: randInt(5, 50),
  };
}

// --- EJECUCIÓN ---

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI no está definido");

  try {
    await mongoose.connect(uri);
    console.log("🚀 Conexión establecida con MongoDB");

    // Limpiar base de datos antes de insertar (Opcional, pero recomendado para tests)
    // await Product.deleteMany({}); 
    // console.log("✅ Base de datos limpiada.");

    const docs = Array.from({ length: 30 }).map((_, idx) => makeProduct(idx + 1));
    const inserted = await Product.insertMany(docs);

    console.log(`✅ ${inserted.length} Productos insertados con éxito.`);
  } catch (error) {
    console.error("❌ Error en el seed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Desconectado de MongoDB.");
  }
}

run();