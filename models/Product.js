const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  price: { 
    type: Number, 
    required: [true, 'Product price is required'],
    min: [0, 'Price must be a positive number'],
    set: v => parseFloat(v.toFixed(2)) // Store with 2 decimal places
  },
  category: { 
    type: String, 
    required: [true, 'Product category is required'],
    trim: true
  },
  stock: { 
    type: Number, 
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  imageUrl: {
  type: String,
  required: true,
  get: function(image) {
    if (!image) return '/uploads/default.png';
    if (image.startsWith('http')) return image;
    // Ensure consistent URL format
    return `/uploads/${image.replace(/^\/+/, '')}`;
  }
},
  createdAt: { 
    type: Date, 
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for formatted price display
productSchema.virtual('formattedPrice').get(function() {
  return `₹${this.price.toFixed(2)}`;
});

module.exports = mongoose.model('Product', productSchema);