const Cart = require("../models/Cart");
const Product = require("../models/Product");

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

exports.getMyCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId || !size || !color?.name || !color?.hex) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos: productId, size, color{name,hex}",
      });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: "quantity debe ser >= 1" });
    }

    const product = await Product.findById(productId).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Producto no encontrado" });
    }

    const cart = await getOrCreateCart(req.user.id);

    // criterio de "mismo item": mismo producto + misma talla + mismo color hex
    const existing = cart.items.find(
      (i) =>
        i.product.toString() === productId &&
        i.size === size &&
        i.color?.hex?.toLowerCase() === color.hex.toLowerCase()
    );

    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        imageAlt: product.imageAlt, // opcional
        color: { name: color.name, hex: color.hex },
        size,
        quantity: qty,
      });
    }

    await cart.save();
    res.status(201).json({ success: true, data: cart });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ success: false, message: "quantity debe ser >= 1" });
    }

    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item no encontrado" });
    }

    item.quantity = qty;
    await cart.save();

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({ success: false, message: "Item no encontrado" });
    }

    item.deleteOne();
    await cart.save();

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await cart.save();

    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};