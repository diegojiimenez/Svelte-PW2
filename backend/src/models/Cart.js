const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true, trim: true },
    imageAlt: { type: String, trim: true }, // opcional

    // selección del usuario
    color: {
      name: { type: String, required: true, trim: true },
      hex: { type: String, required: true, trim: true },
    },
    size: { type: String, required: true, trim: true },

    // cantidad en carrito
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);