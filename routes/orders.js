// In routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// POST /api/orders
router.post("/", async (req, res) => {
  try {
    const { email, items, total, paymentMethod, status, placedAt } = req.body;
    
    const newOrder = new Order({ 
      email, 
      items, 
      total, 
      paymentMethod,
      status: status || "Pending",
      placedAt: placedAt || Date.now()
    });
    
    await newOrder.save();
    
    // Emit socket event for real-time update
    req.io.emit("new-order", newOrder);
    
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to place order" });
  }
});

// GET /api/orders
router.get("/", async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { "items.name": { $regex: search, $options: "i" } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query).sort({ placedAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


// Update order status
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    req.io.emit('order-updated', order);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:id
// Delete order
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    req.io.emit('order-deleted', order._id);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;