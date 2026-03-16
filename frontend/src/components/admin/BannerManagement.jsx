import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { Image as ImageIcon, Plus, Trash2, Link, Type, Activity, Monitor } from "lucide-react";

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [title, setTitle] = useState(""); // Added title
  const [imageUrl, setImageUrl] = useState(""); // Changed 'image' to 'imageUrl'

  const fetchBanners = async () => {
    const res = await api.get("/banners");
    setBanners(res.data);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const addBanner = async () => {
    if (!imageUrl) return;
    // We send 'title' and 'image_url' to match your SQL table
    await api.post("/banners", { 
      title: title || "New Banner", 
      image_url: imageUrl 
    });
    setImageUrl("");
    setTitle("");
    fetchBanners();
  };

  const deleteBanner = async (id) => {
    await api.delete(`/banners/${id}`);
    fetchBanners();
  };

  const brand = {
    emerald: "#10b981",
    navy: "#0f172a",
    slate: "#64748b",
    bg: "#f8fafc",
    border: "#e2e8f0"
  };

  return (
    <div style={{ padding: "40px", backgroundColor: brand.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div>
            <h2 style={{ fontSize: "32px", fontWeight: "800", color: brand.navy, margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ backgroundColor: brand.emerald, padding: "8px", borderRadius: "12px", display: "flex" }}>
                <Monitor size={24} color="white" />
              </div>
              Banner Management
            </h2>
            <p style={{ color: brand.slate, marginTop: "8px", fontSize: "16px" }}>Update your homepage hero section and promotions.</p>
          </div>
          <div style={{ backgroundColor: "#ecfdf5", color: brand.emerald, padding: "8px 16px", borderRadius: "100px", fontSize: "14px", fontWeight: "700", border: "1px solid #d1fae5", display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={16} /> Live on Site
          </div>
        </div>

        {/* INPUT CARD */}
        <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", border: `1px solid ${brand.border}`, marginBottom: "40px" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "18px", color: brand.navy, fontWeight: "700" }}>Upload New Banner</h3>
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Type size={18} color={brand.slate} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                placeholder="Banner Title (Optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "14px 14px 14px 45px", borderRadius: "14px", border: `2px solid ${brand.bg}`, outline: "none", fontSize: "14px" }}
              />
            </div>
            <div style={{ flex: 2, position: "relative" }}>
              <Link size={18} color={brand.slate} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                placeholder="Paste Banner Image URL here..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ width: "100%", padding: "14px 14px 14px 45px", borderRadius: "14px", border: `2px solid ${brand.bg}`, outline: "none", fontSize: "14px" }}
              />
            </div>
            <button 
              onClick={addBanner} 
              style={{ backgroundColor: brand.emerald, color: "white", padding: "14px 28px", borderRadius: "14px", border: "none", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}
            >
              <Plus size={20} /> Add
            </button>
          </div>
        </div>

        {/* BANNER LIST */}
        <div style={{ display: "grid", gap: "20px" }}>
          {banners.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px", backgroundColor: "white", borderRadius: "24px", color: brand.slate, border: `1px dashed ${brand.border}` }}>
              <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: "10px" }} />
              <p>No banners active. Add your first one above!</p>
            </div>
          )}
          
          {banners.map((b) => (
            <div 
              key={b.id} 
              style={{ display: "flex", alignItems: "center", gap: "25px", backgroundColor: "white", padding: "15px", borderRadius: "24px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)", border: `1px solid ${brand.border}`, transition: "transform 0.2s" }}
            >
              <div style={{ position: "relative", width: "240px", height: "120px", overflow: "hidden", borderRadius: "16px" }}>
                <img 
                  src={b.image_url} 
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  alt={b.title} 
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "12px", color: brand.emerald, fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Active Banner</div>
                <h4 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: brand.navy }}>{b.title}</h4>
                <div style={{ fontSize: "13px", color: brand.slate, marginTop: "8px", wordBreak: "break-all", maxWidth: "400px" }}>{b.image_url}</div>
              </div>

              <button 
                onClick={() => deleteBanner(b.id)} 
                style={{ background: "#fff1f2", color: "#e11d48", border: "1px solid #ffe4e6", padding: "12px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#e11d48"; e.currentTarget.style.color = "white"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "#fff1f2"; e.currentTarget.style.color = "#e11d48"; }}
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;