import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { ShoppingBag, User, CreditCard, ChevronDown, Activity, Hash, Mail, Search, Filter } from "lucide-react";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // Added for searching
  const [filterStatus, setFilterStatus] = useState("all"); // Added for filtering

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/orders/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Fetch orders error:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
    } catch (error) {
      console.error("Update status error:", error);
    }
  };

  // --- FILTERING LOGIC (Does not change your original data) ---
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.id.toString().includes(searchTerm) || 
      (o.user_name && o.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.user_email && o.user_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === "all" || o.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: "#fff7ed", text: "#c2410c", border: "#ffedd5" },
      paid: { bg: "#ecfdf5", text: "#059669", border: "#d1fae5" },
      confirmed: { bg: "#eff6ff", text: "#1d4ed8", border: "#dbeafe" },
      shipped: { bg: "#f5f3ff", text: "#7c3aed", border: "#ede9fe" },
      delivered: { bg: "#10b981", text: "#ffffff", border: "#059669" },
      cancelled: { bg: "#fff1f2", text: "#e11d48", border: "#ffe4e6" },
      returned: { bg: "#f8fafc", text: "#475569", border: "#e2e8f0" },
    };
    const style = styles[status] || styles.pending;
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        display: 'inline-block'
      }}>
        {status}
      </span>
    );
  };

  const brand = {
    emerald: "#10b981",
    navy: "#0f172a",
    slate: "#64748b",
    bg: "#f1f5f9"
  };

  return (
    <div style={{ backgroundColor: brand.bg, padding: '40px', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* BRANDED HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
               <div style={{ backgroundColor: brand.emerald, padding: '8px', borderRadius: '12px' }}>
                  <ShoppingBag color="white" size={24} />
               </div>
               <h2 style={{ fontSize: '28px', fontWeight: '800', color: brand.navy, margin: 0 }}>Order Management</h2>
            </div>
            <p style={{ color: brand.slate, margin: 0, fontSize: '15px' }}>Monitor sales and track fulfillment status across the marketplace.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ backgroundColor: 'white', padding: '10px 20px', borderRadius: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '14px', fontWeight: '700', color: brand.navy }}>
              {filteredOrders.length} Results
            </div>
            <div style={{ backgroundColor: '#ecfdf5', padding: '10px 20px', borderRadius: '14px', border: '1px solid #d1fae5', color: brand.emerald, fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} /> Admin Mode
            </div>
          </div>
        </div>

        {/* --- SEARCH & FILTER BAR --- */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
            <div style={{ position: 'relative', flex: 2 }}>
                <Search size={18} color={brand.slate} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                    type="text" 
                    placeholder="Search Order ID, Customer Name or Email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={searchFieldStyle}
                />
            </div>
            <div style={{ position: 'relative', flex: 1 }}>
                <Filter size={18} color={brand.slate} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ ...searchFieldStyle, paddingLeft: '45px', appearance: 'none' }}
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
        </div>

        {/* DATA TABLE CARD */}
        <div style={{ backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '20px', fontSize: '12px', color: brand.slate, fontWeight: '700', textTransform: 'uppercase' }}>ID</th>
                <th style={{ padding: '20px', fontSize: '12px', color: brand.slate, fontWeight: '700', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '20px', fontSize: '12px', color: brand.slate, fontWeight: '700', textTransform: 'uppercase' }}>Total Amount</th>
                <th style={{ padding: '20px', fontSize: '12px', color: brand.slate, fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '20px', fontSize: '12px', color: brand.slate, fontWeight: '700', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: brand.navy, fontWeight: '700' }}>
                      <Hash size={14} color={brand.emerald} /> {o.id}
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color={brand.slate} />
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: brand.navy, fontSize: '14px' }}>{o.user_name || "Guest"}</div>
                        <div style={{ fontSize: '12px', color: brand.slate, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {o.user_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: brand.navy }}>
                      <CreditCard size={16} color={brand.slate} />
                      {parseFloat(o.total_amount).toLocaleString()} <span style={{ fontSize: '10px', color: brand.emerald }}>ETB</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px', textAlign: 'center' }}>
                    {getStatusBadge(o.status)}
                  </td>
                  <td style={{ padding: '20px', textAlign: 'right' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <select
                        style={{
                          appearance: 'none',
                          backgroundColor: '#f8fafc',
                          border: '2px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '8px 35px 8px 15px',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: brand.navy,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: brand.slate }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', color: brand.slate }}>
              <Search size={48} style={{ opacity: 0.2, marginBottom: '10px' }} />
              <p>No orders match your current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Internal Style for Search Inputs
const searchFieldStyle = {
    width: '100%',
    padding: '12px 15px 12px 45px',
    borderRadius: '14px',
    border: '2px solid #e2e8f0',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
};

export default OrderManagement;