import { useState } from "react";
import axios from "axios";

export default function AddProduct() {
  const [form, setForm] = useState({ name: "", price: "", stock: "", category: "", description: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.post("/api/products", form);
    alert("Product added");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" onChange={handleChange} placeholder="Product Name" />
      <input name="price" type="number" onChange={handleChange} placeholder="Price" />
      <input name="stock" type="number" onChange={handleChange} placeholder="Stock" />
      <input name="category" onChange={handleChange} placeholder="Category" />
      <textarea name="description" onChange={handleChange} placeholder="Description" />
      <button type="submit">Add Product</button>
    </form>
  );
}
