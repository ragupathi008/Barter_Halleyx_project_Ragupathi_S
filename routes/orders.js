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

module.exports = router;