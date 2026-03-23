const mongoose = require("mongoose");

const productColorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: true,
    },

    category: { type: String, required: true, trim: true },

    image: { type: String, required: true, trim: true },

    // OPCIONAL (como pediste)
    imageAlt: { type: String, trim: true },

    colors: { type: [productColorSchema], default: [] },

    sizes: { type: [String], default: [] },

    description: { type: String, required: true, trim: true },

    quantity: { type: Number, required: true, min: 0, default: 0 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);