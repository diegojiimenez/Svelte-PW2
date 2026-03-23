const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  getMyCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
} = require("../controllers/cart.controller");

router.get("/", protect, getMyCart);
router.post("/items", protect, addItem);
router.put("/items/:itemId", protect, updateItemQuantity);
router.delete("/items/:itemId", protect, removeItem);
router.delete("/clear", protect, clearCart);

module.exports = router;