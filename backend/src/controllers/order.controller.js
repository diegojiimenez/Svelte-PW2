const Order = require("../models/Order");
const Cart = require("../models/Cart");

function formatAdminDate(date) {
  // Tu UI tiene "Oct 24, 2026"
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function formatMoneyUSD(amount) {
  // Tu UI tiene "$189"
  const rounded = Math.round(amount);
  return `$${rounded}`;
}

// DTO para el admin table (calza con Admin.svelte)
function toAdminRow(order, userDoc) {
  const count = order.items?.length || 0;

  let itemText = "(no items)";
  if (count === 1) {
    itemText = order.items[0].name;
  } else if (count > 1) {
    itemText = `${order.items[0].name} +${count - 1} more`;
    // alternativa simple: itemText = `${count} items`;
  }

  const customerName =
    userDoc?.nombre && userDoc?.apellido
      ? `${userDoc.nombre} ${userDoc.apellido}`
      : userDoc?.email || "Unknown";

  return {
    id: order.orderNumber,
    customer: customerName,
    item: itemText,
    date: formatAdminDate(order.createdAt),
    total: formatMoneyUSD(order.total),
    status: order.status,
  };
}

// POST /api/orders  (crea una orden desde el carrito del usuario)
exports.createOrderFromMyCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).lean();

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "El carrito está vacío" });
    }

    const items = cart.items.map((i) => {
      const subtotal = i.price * i.quantity;
      return {
        product: i.product,
        name: i.name,
        image: i.image,
        imageAlt: i.imageAlt,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        priceUnit: i.price,
        subtotal,
      };
    });

    const subtotal = items.reduce((acc, i) => acc + i.subtotal, 0);

    // para empezar: tax=0 (luego lo calculamos si quieres)
    const tax = 0;
    const total = subtotal + tax;

    const orderNumber = await Order.generateOrderNumber();

    const order = await Order.create({
      user: req.user.id,
      orderNumber,
      items,
      subtotal,
      tax,
      total,
      status: "Placed",
    });

    // vaciar carrito después de ordenar
    await Cart.updateOne({ user: req.user.id }, { $set: { items: [] } });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: GET /api/orders (lista para tabla admin)
exports.getAllOrdersForAdminTable = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "nombre apellido email")
      .lean();

    const rows = orders.map((o) => toAdminRow(o, o.user));
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADMIN: PUT /api/orders/:orderNumber/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body;

    const allowed = ["Placed", "In Transit", "Completed", "Cancelled"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Status inválido" });
    }

    const updated = await Order.findOneAndUpdate(
      { orderNumber },
      { status },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: "Orden no encontrada" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};