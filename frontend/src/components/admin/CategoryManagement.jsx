import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // IMPORT THIS
import api from "../../utils/api";
import { FolderPlus, Trash2, Layers, Search, Plus, Activity, ExternalLink } from "lucide-react";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!name) return;
    await api.post("/categories", { name });
    setName("");
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    await api.delete(`/categories/${id}`);
    fetchCategories();
  };

  const colors = {
    emerald: "#10b981",
    navy: "#0f172a",
    slate: "#64748b",
    bg: "#f8fafc"
  };

  return (
    <div style={{ padding: '40px', backgroundColor: colors.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: colors.navy, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Layers size={36} color={colors.emerald} />
              Category Management
            </h2>
            <p style={{ color: colors.slate, marginTop: '8px', fontSize: '16px' }}>Manage and link your marketplace hierarchy.</p>
          </div>
          <div style={{ backgroundColor: '#ecfdf5', color: colors.emerald, padding: '8px 16px', borderRadius: '100px', fontSize: '14px', fontWeight: '700', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} /> System Online
          </div>
        </div>

        {/* ADD CATEGORY INPUT */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FolderPlus size={20} color={colors.slate} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                style={{ width: '100%', padding: '16px 16px 16px 50px', borderRadius: '16px', border: '2px solid #f1f5f9', outline: 'none', fontSize: '15px' }}
                placeholder="Enter new category name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button 
              onClick={addCategory}
              style={{ backgroundColor: colors.emerald, color: 'white', padding: '0 30px', borderRadius: '16px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <Plus size={20} /> Add Category
            </button>
          </div>
        </div>

        {/* CATEGORY LIST GRID */}
        <div style={{ backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 30px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: colors.navy, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Search size={18} /> Available Categories
            </h3>
            <span style={{ fontSize: '13px', fontWeight: '600', color: colors.slate }}>Click name to view in Shop</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', padding: '30px' }}>
            {categories.map((c) => (
              <div 
                key={c.id} 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '18px', border: '1px solid #f1f5f9' }}
              >
                {/* FIXED: Added Link wrapper so it goes to the Shop page */}
                <Link 
                  to={`/shop?category=${c.name}`} 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit', flex: 1 }}
                >
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: colors.emerald, border: '1px solid #e2e8f0' }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: '700', color: colors.navy }}>{c.name}</span>
                    <span style={{ fontSize: '11px', color: colors.emerald, display: 'flex', alignItems: 'center', gap: '3px' }}>
                       View Shop <ExternalLink size={10} />
                    </span>
                  </div>
                </Link>

                <button 
                  onClick={() => deleteCategory(c.id)}
                  style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '8px' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryManagement;