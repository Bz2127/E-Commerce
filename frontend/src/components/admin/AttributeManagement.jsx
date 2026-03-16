import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Settings, Plus, Trash2, Tag, Layers, AlertCircle, X } from "lucide-react";

const AttributeManagement = () => {
  const [attributes, setAttributes] = useState([]);
  const [name, setName] = useState("");

  const [values, setValues] = useState({});
  const [newValue, setNewValue] = useState({});

  const brand = {
    emerald: "#10b981",
    navy: "#0f172a",
    slate: "#64748b",
    bg: "#f1f5f9",
    white: "#ffffff"
  };

  const fetchAttributes = async () => {
    try {
      const res = await api.get("/attributes");
      const attrs = res.data.data || [];
      setAttributes(attrs);

      attrs.forEach(async (attr) => {
        const valRes = await api.get(`/attributes/value/${attr.id}`);
        setValues((prev) => ({
          ...prev,
          [attr.id]: valRes.data.data || []
        }));
      });

    } catch (error) {
      console.error("Error fetching attributes:", error);
      setAttributes([]);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const addAttribute = async () => {
    if (!name.trim()) return;

    await api.post("/attributes", { name: name.trim() });

    setName("");
    fetchAttributes();
  };

  const deleteAttribute = async (id) => {
    if (window.confirm("Are you sure you want to delete this attribute and all its values?")) {
      await api.delete(`/attributes/${id}`);
      fetchAttributes();
    }
  };

  const addValue = async (attribute_id) => {
    const value = newValue[attribute_id];

    if (!value || !value.trim()) return;

    await api.post("/attributes/value", {
      attribute_id,
      value: value.trim()
    });

    setNewValue((prev) => ({
      ...prev,
      [attribute_id]: ""
    }));

    fetchAttributes();
  };

  // NEW FUNCTION → DELETE VALUE
  const deleteValue = async (value_id) => {
    if (window.confirm("Delete this value?")) {
      await api.delete(`/attributes/value/${value_id}`);
      fetchAttributes();
    }
  };

  const inputStyle = {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    transition: 'border-color 0.2s'
  };

  const btnPrimary = {
    backgroundColor: brand.emerald,
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  return (
    <div style={{ backgroundColor: brand.bg, minHeight: '100vh', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ backgroundColor: brand.navy, padding: '8px', borderRadius: '12px' }}>
                <Settings color="white" size={24} />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: brand.navy, margin: 0 }}>Attribute Management</h2>
            </div>
            <p style={{ color: brand.slate, margin: 0 }}>Define product variations like Size, Color, and Material.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: brand.emerald, fontWeight: '700', fontSize: '14px', backgroundColor: '#ecfdf5', padding: '8px 16px', borderRadius: '20px' }}>
            <Layers size={16} /> {attributes.length} Active Attributes
          </div>
        </div>

        {/* CREATE ATTRIBUTE */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: brand.navy, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color={brand.emerald} /> Create New Attribute
          </h3>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <input
                placeholder="Attribute name (e.g. Color, Material, Size)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button onClick={addAttribute} style={btnPrimary}>
              Add Attribute
            </button>
          </div>
        </div>

        {/* ATTRIBUTE GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '24px' }}>
          {Array.isArray(attributes) && attributes.length > 0 ? (
            attributes.map((a) => (
              <div key={a.id} style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* HEADER */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Tag size={18} color={brand.navy} />
                    <strong style={{ fontSize: '18px', color: brand.navy }}>{a.name}</strong>
                  </div>

                  <button onClick={() => deleteAttribute(a.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* VALUES */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(values[a.id] || []).length > 0 ? (
                    (values[a.id] || []).map((v) => (
                      <span
                        key={v.id}
                        style={{
                          padding: "6px 12px",
                          background: "#f8fafc",
                          border: '1px solid #e2e8f0',
                          color: brand.navy,
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: '600',
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        {v.value}

                        <button
                          onClick={() => deleteValue(v.id)}
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            color: "#ef4444",
                            display: "flex"
                          }}
                        >
                          <X size={14} />
                        </button>

                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '13px', color: brand.slate, fontStyle: 'italic' }}>No values added yet</span>
                  )}
                </div>

                {/* ADD VALUE */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <input
                    placeholder="New value (e.g. XL)"
                    value={newValue[a.id] || ""}
                    onChange={(e) =>
                      setNewValue((prev) => ({
                        ...prev,
                        [a.id]: e.target.value
                      }))
                    }
                    style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }}
                  />

                  <button
                    onClick={() => addValue(a.id)}
                    style={{ backgroundColor: brand.navy, color: 'white', border: 'none', padding: '0 16px', borderRadius: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Add Value
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '24px', color: brand.slate }}>
              <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p style={{ margin: 0, fontWeight: '600' }}>No attributes found.</p>
              <p style={{ margin: 0, fontSize: '14px' }}>Start by adding one like "Size" or "Color".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttributeManagement;