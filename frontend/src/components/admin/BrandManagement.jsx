import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [name, setName] = useState("");

  const fetchBrands = async () => {
    const res = await api.get("/brands");
    setBrands(res.data);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const addBrand = async () => {
    if (!name) return;
    await api.post("/brands", { name });
    setName("");
    fetchBrands();
  };

  const deleteBrand = async (id) => {
    await api.delete(`/brands/${id}`);
    fetchBrands();
  };

  return (
    <div>
      <h2>🏷 Brand Management</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Brand name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addBrand}>Add</button>
      </div>

      {brands.map((b) => (
        <div key={b.id}>
          {b.name}
          <button onClick={() => deleteBrand(b.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default BrandManagement;