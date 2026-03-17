import React, { useEffect, useState } from "react";

import api from "../utils/api"; 
import toast from "react-hot-toast";
import { Search, CheckCircle, XCircle, Package, ShieldCheck, Info, Store } from "lucide-center";

const ProductModeration = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // Added search state

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      
      const res = await api.get("/admin/products/pending");
      setProducts(res.data);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const approveProduct = async (id) => {
    try {
      
      await api.patch(`/admin/products/${id}/approve`);
      toast.success("Product approved successfully!");
      fetchPendingProducts();
    } catch (error) {
      toast.error("Failed to approve product");
      console.error("Approve failed", error);
    }
  };

  const rejectProduct = async (id) => {
    try {
      
      await api.patch(`/admin/products/${id}/reject`);
      toast.error("Product has been rejected"); 
      fetchPendingProducts();
    } catch (error) {
      toast.error("Failed to reject product");
      console.error("Reject failed", error);
    }
  };

  // Logic for searching
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.business_name && p.business_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const brand = { emerald: "#10b981", navy: "#0f172a", bg: "#f8fafc", border: "#e2e8f0" };

  return (
    <div style={{ padding: "40px", backgroundColor: brand.bg, minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* HEADER SECTION */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
          <div>
            <h2 style={{ fontSize: "32px", fontWeight: "800", color: brand.navy, margin: 0, display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ backgroundColor: brand.emerald, padding: "8px", borderRadius: "12px", display: "flex" }}>
                <ShieldCheck size={28} color="white" />
              </div>
              Product Moderation
            </h2>
            <p style={{ color: "#64748b", marginTop: "8px", fontSize: "16px" }}>Review and approve products before they go live on EthMarket.</p>
          </div>
          
          {/* SEARCH BAR */}
          <div style={{ position: "relative", width: "350px" }}>
            <Search size={18} color="#94a3b8" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text"
              placeholder="Search by product or seller..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "12px 12px 12px 48px", borderRadius: "14px", border: `1px solid ${brand.border}`, outline: "none", fontSize: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
            />
          </div>
        </div>

        {/* SUMMARY STATS */}
        <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "18px", flex: 1, border: `1px solid ${brand.border}`, display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ background: "#fff7ed", padding: "10px", borderRadius: "12px" }}><Package color="#f59e0b" /></div>
            <div>
              <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "600" }}>Pending Approval</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: brand.navy }}>{products.length} Items</div>
            </div>
          </div>
          <div style={{ background: "white", padding: "20px", borderRadius: "18px", flex: 2, border: `1px solid ${brand.border}`, display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ background: "#eff6ff", padding: "10px", borderRadius: "12px" }}><Info color="#3b82f6" /></div>
            <div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
              Review images and pricing carefully. Approved products will be immediately visible to all customers on the marketplace.
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div style={{ background: "white", borderRadius: "24px", border: `1px solid ${brand.border}`, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: "100px", textAlign: "center", color: "#64748b" }}>
              <div className="animate-spin" style={{ width: "30px", height: "30px", border: "3px solid #f1f5f9", borderTopColor: brand.emerald, borderRadius: "50%", margin: "0 auto 15px" }}></div>
              Loading pending products...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#fcfdfe", borderBottom: `1px solid ${brand.border}` }}>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", width: "100px" }}>Image</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Product Name</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Seller</th>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Price</th>
                    <th style={{ padding: "16px 24px", textAlign: "center", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Status</th>
                    <th style={{ padding: "16px 24px", textAlign: "right", fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: "80px 24px", textAlign: "center", color: "#94a3b8" }}>
                        <Package size={40} style={{ margin: "0 auto 10px", opacity: 0.2 }} />
                        <p>{searchTerm ? "No products match your search" : "All caught up! No pending products"}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} style={{ transition: "background 0.2s" }} className="hover:bg-gray-50">
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ width: "60px", height: "60px", borderRadius: "12px", backgroundColor: "#f1f5f9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
                            {product.images && product.images.length > 0 ? (
                              <img 
                                src={`http://localhost:5000/uploads/products/${product.images[0]}`} 
                                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                                alt="product"
                                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${product.name}&background=random`; }}
                              />
                            ) : (
                              <div style={{ fontSize: "10px", color: "#94a3b8" }}>No Image</div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: brand.navy }}>{product.name}</div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>ID: #{product.id}</div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#475569" }}>
                            <Store size={14} color="#94a3b8" /> {product.business_name || "Unknown Seller"}
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ fontSize: "15px", fontWeight: "800", color: brand.emerald }}>{parseFloat(product.base_price).toLocaleString()} ETB</div>
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "center" }}>
                          <span style={{ padding: "6px 12px", backgroundColor: "#fef3c7", color: "#d97706", borderRadius: "100px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                            {product.status}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "right" }}>
                          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => approveProduct(product.id)}
                              style={{ padding: "10px 16px", backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #d1fae5", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
                            >
                              <CheckCircle size={16} /> Approve
                            </button>
                            <button
                              onClick={() => rejectProduct(product.id)}
                              style={{ padding: "10px 16px", backgroundColor: "#fff1f2", color: "#e11d48", border: "1px solid #ffe4e6", borderRadius: "10px", cursor: "pointer", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
                            >
                              <XCircle size={16} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductModeration;