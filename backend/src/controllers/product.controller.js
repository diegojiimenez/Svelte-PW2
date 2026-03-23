const Product = require("../models/Product");

// helper para mapear _id -> id
function toProductDTO(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    price: doc.price,
    status: doc.status,
    category: doc.category,
    image: doc.image,
    imageAlt: doc.imageAlt, // puede venir undefined (ok)
    colors: doc.colors || [],
    sizes: doc.sizes || [],
    description: doc.description,
    quantity: doc.quantity,
  };
}

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: products.map(toProductDTO) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }
    res.json({ success: true, data: toProductDTO(product) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Crear (admin)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user?.id,
    });

    res.status(201).json({ success: true, data: toProductDTO(product.toObject()) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    res.json({ success: true, data: toProductDTO(updated) });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id).lean();

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    res.json({ success: true, message: "Producto eliminado", data: toProductDTO(deleted) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};