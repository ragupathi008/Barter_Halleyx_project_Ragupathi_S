import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ProductList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("/api/products").then(res => setProducts(res.data));
  }, []);

  const handleDelete = async (id) => {
    await axios.delete(`/api/products/${id}`);
    setProducts(products.filter(p => p._id !== id));
  };

  return (
    <div>
      <h2>Product List</h2>
      <Link to="/admin/products/new">Add Product</Link>
      <ul>
        {products.map(p => (
          <li key={p._id}>
            {p.name} - ₹{p.price}
            <Link to={`/admin/products/edit/${p._id}`}>Edit</Link>
            <button onClick={() => handleDelete(p._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
