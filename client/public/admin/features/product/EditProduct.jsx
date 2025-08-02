import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function EditProduct() {
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", price: "", stock: "", category: "", description: "" });

  useEffect(() => {
    axios.get(`/api/products/${id}`).then(res => setForm(res.data));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    await axios.put(`/api/products/${id}`, form);
    alert("Product updated");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="price" type="number" value={form.price} onChange={handleChange} />
      <input name="stock" type="number" value={form.stock} onChange={handleChange} />
      <input name="category" value={form.category} onChange={handleChange} />
      <textarea name="description" value={form.description} onChange={handleChange} />
      <button type="submit">Update Product</button>
    </form>
  );
}
