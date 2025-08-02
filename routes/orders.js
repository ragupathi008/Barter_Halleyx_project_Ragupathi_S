// routes/order.js
const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// POST /api/orders
router.post("/", async (req, res) => {
  try {
    const { email, items, total, paymentMethod } = req.body;
    const newOrder = new Order({ email, items, total, paymentMethod });
    await newOrder.save();
    res.status(201).json({ message: "Order placed!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to place order" });
  }
});

module.exports = router;
