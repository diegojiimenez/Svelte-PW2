const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const {
  createOrderFromMyCart,
  getMyOrders,
  getAllOrdersForAdminTable,
  updateOrderStatus,
} = require("../controllers/order.controller");

// Usuario
router.post("/", protect, createOrderFromMyCart);
router.get("/my", protect, getMyOrders);

// Admin
router.get("/", protect, authorize("administrador"), getAllOrdersForAdminTable);
router.put("/:orderNumber/status", protect, authorize("administrador"), updateOrderStatus);

module.exports = router;