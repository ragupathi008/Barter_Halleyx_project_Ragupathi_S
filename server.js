const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Load environment variables first
dotenv.config();

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io AFTER server is created
const io = new Server(server, { 
  cors: { 
    origin: 'http://localhost:5000/socket.io/?EIO=4&transport=polling&t=1iouyc0e'
  } 
});

// Models
const User = require("./models/User");
const Order = require("./models/Order");

// Routes
const productRoutes = require("./routes/products");

// Middleware
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://codeandescape:maddyanna12@cluster0.cjlsm6y.mongodb.net/?retryWrites=true&w=majority&appName=cluster0")
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Routes
app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword, role });
  await newUser.save();

  res.status(201).json({ message: "Signup successful" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  res.status(200).json({
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
    }
  });
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!name || !role) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Server error during user update" });
  }
});

app.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted successfully" });
});

app.use("/api/products", productRoutes);

// Order Routes
app.post("/api/orders", async (req, res) => {
  try {
    const order = new Order(req.body);
    const saved = await order.save();
    res.status(201).json(saved);
    io.emit("order-placed", saved); // also emit to real-time clients
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    io.emit('order-updated', order);
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.patch("/api/orders/:id", async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updated);
    io.emit("order-updated", updated); // notify real-time clients
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

io.on("connection", socket => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("place-order", async (orderData) => {
    try {
      const newOrder = new Order(orderData);
      const saved = await newOrder.save();
      io.emit("order-placed", saved); // Broadcast to all clients
    } catch (err) {
      console.error("Order save error:", err);
    }
  });

  // ... other events like 'update-status'
});

