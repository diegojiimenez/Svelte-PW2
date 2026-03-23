const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require("../controllers/product.controller");

// Lectura: protegida (para tu tienda normalmente sí)
router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);

// Escritura: solo admin
router.post("/", protect, authorize("administrador"), createProduct);
router.put("/:id", protect, authorize("administrador"), updateProduct);
router.delete("/:id", protect, authorize("administrador"), deleteProduct);

module.exports = router;