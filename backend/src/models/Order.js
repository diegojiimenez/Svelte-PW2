const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    name: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    imageAlt: { type: String, trim: true }, // opcional

    quantity: { type: Number, required: true, min: 1 },

    size: { type: String, required: true, trim: true },
    color: {
      name: { type: String, required: true, trim: true },
      hex: { type: String, required: true, trim: true },
    },

    priceUnit: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    orderNumber: { type: String, required: true, unique: true },

    items: { type: [orderItemSchema], required: true },

    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["Placed", "In Transit", "Completed", "Cancelled"],
      default: "Placed",
      required: true,
    },
  },
  { timestamps: true }
);

orderSchema.statics.generateOrderNumber = async function () {
  const count = await this.countDocuments();
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `ORD-${timestamp}-${random}-${count + 1}`;
};

module.exports = mongoose.model("Order", orderSchema);