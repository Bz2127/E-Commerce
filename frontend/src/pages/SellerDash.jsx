import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  LayoutDashboard, ShoppingBag, PackagePlus, Wallet, 
  LogOut, Settings, User, Building, 
  Trash2, ListOrdered, CheckCircle, ChevronRight, Printer,Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from "react-hot-toast";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- BRAND CONSTANTS ---
const BrandColors = {
  primary: '#10b981',       
  sidebarBg: '#111827',     
  sidebarHover: 'rgba(16, 185, 129, 0.1)',
  textMuted: '#94a3b8',     
  bgLight: '#f1f5f9'        
};
const sidebarLabel = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin: '20px 0 10px 20px'
};
// --- STYLES & HELPERS ---
const showSuccessToast = (message) => { 
  toast.success(message, { 
    style: { 
      background: '#f8fafc', 
      border: `2px solid ${BrandColors.primary}`, 
      borderRadius: '30px', 
      padding: '12px 18px', 
      fontWeight: '600', 
      fontSize: '14px', 
      color: BrandColors.secondary, 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px' 
    }, 
    iconTheme: { primary: BrandColors.primary, secondary: '#ffffff' }, 
    duration: 3000 
  }); 
};

const menuItemStyle = (active) => ({
  padding: '12px 20px',
  borderRadius: '12px',
  cursor: 'pointer',
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  margin: '4px 15px',
  transition: 'all 0.2s ease',
  background: active ? BrandColors.sidebarHover : 'transparent',
  color: active ? BrandColors.primary : '#94a3b8',
  fontWeight: active ? '600' : '500',
  fontSize: '14px',
  borderLeft: active ? `4px solid ${BrandColors.primary}` : '4px solid transparent'
});

const statusBadge = (s) => { 
  const status = s?.toLowerCase(); 
  let bg = '#fef3c7', col = '#92400e'; 
  if (status === 'delivered') { bg = '#dcfce7'; col = '#166534'; } 
  if (status === 'shipped') { bg = '#dbeafe'; col = '#1e40af'; } 
  if (status === 'paid') { bg = '#eff6ff'; col = '#1d4ed8'; } 
  if (status === 'accepted') { bg = '#f0fdf4'; col = '#15803d'; }
  return { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', background: bg, color: col, display: 'inline-block' }; 
};

const actionBtn = (bg) => ({ background: bg, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s', display: 'inline-flex', alignItems: 'center', gap: '5px' });
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' };
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '15px', fontSize: '14px', outline: 'none', background: '#f8fafc', boxSizing: 'border-box' };
const glassCard = { background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' };
const thStyle = { padding: '14px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0', textAlign: 'left' };
const tdStyle = { padding: '16px', fontSize: '14px', color: '#1e293b', borderBottom: '1px solid #f1f5f9' };

// --- SUB-COMPONENTS ---

const SellerOverview = ({ config }) => {
const [stats, setStats] = useState({
  totalProducts: 0, 
  walletBalance: 0, 
  totalOrders: 0, 
  pendingOrders: 0, 
  totalRevenue: 0, 
  topProducts: [], 
  salesHistory: []
});
  useEffect(() => {
    api.get('/seller/stats')
      .then(res => setStats({ ...res.data, topProducts: res.data.topProducts || [], salesHistory: res.data.salesHistory || [] }))
      .catch(err => console.error(err));
  }, [config]);

  const chartData = {
    labels: stats.salesHistory.map(s => s.date),
    datasets: [{
      label: 'Daily Sales (ETB)',
      data: stats.salesHistory.map(s => s.revenue),
      backgroundColor: BrandColors.primary,
      borderRadius: 6
    }]
  };


  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <h2 style={{ marginBottom: '25px', fontWeight: '900', color: BrandColors.secondary, fontSize: '24px' }}>Market Insight</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {[
         { label: 'Wallet Balance', value: `ETB ${(stats.walletBalance || 0).toLocaleString()}`, icon: <Wallet color={BrandColors.primary} />, color: BrandColors.primary },
          { label: 'Active Inventory', value: stats.totalProducts, icon: <ShoppingBag color="#3b82f6" />, color: '#3b82f6' },
          { label: 'Orders Received', value: stats.totalOrders, icon: <CheckCircle color="#10b981" />, color: '#10b981' },
          { label: 'Total Revenue', value: `ETB ${stats.totalRevenue?.toLocaleString()}`, icon: <Building color="#8b5cf6" />, color: '#8b5cf6' }
        ].map((card, idx) => (
          <div key={idx} style={glassCard}>
            <div style={{ background: `${card.color}15`, width: '45px', height: '45px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
              {card.icon}
            </div>
            <p style={{ color: BrandColors.textLight, fontSize: '13px', fontWeight: '600', margin: '0 0 5px 0' }}>{card.label}</p>
            <h3 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: BrandColors.secondary }}>{card.value}</h3>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
        <div style={glassCard}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>Sales Revenue</h3>
          {stats.salesHistory.length > 0 ? (
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          ) : (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No sales data yet</div>
          )}
        </div>

        <div style={glassCard}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>Best Sellers</h3>
          {stats.topProducts.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i !== stats.topProducts.length -1 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>{p.name}</span>
              <span style={{ fontSize: '14px', fontWeight: '800', color: BrandColors.primary }}>{p.total_sold} Sold</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
// --- STYLES & HELPERS (Outside of components) ---
const toggleBtnStyle = {
  position: 'absolute',
  right: '-12px',
  top: '25px',
  background: BrandColors.primary,
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 1001,
  boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)'
};

const SellerOrders = ({ config }) => {
  const [orders, setOrders] = useState([]);
const fetchOrders = useCallback(async () => {
  try {
    const res = await api.get('/seller/orders');
    setOrders(res.data);
  } catch (err) {
    console.error(err);
  }
}, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      api.get('/seller/stats')
      fetchOrders();
      showSuccessToast(`Order marked as ${status}`);
    } catch (err) { toast.error("Status update failed"); }
  };

  return (
    <div style={glassCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ fontWeight: '800', margin: 0 }}>Order Management</h2>
        <button onClick={() => window.print()} style={actionBtn('#64748b')}><Printer size={16}/> Print Report</button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? orders.map(o => {
              const currentStatus = o.status?.toLowerCase();
              const orderId = o.order_id || o.id;
              return (
                <tr key={`${orderId}-${o.variant_id}`}>
                  <td style={tdStyle}>#{orderId}</td>
                  <td style={tdStyle}>{o.product_name}</td>
                  <td style={tdStyle}>{o.customer_name}</td>
                  <td style={tdStyle}><span style={statusBadge(o.status)}>{o.status}</span></td>
                  <td style={tdStyle}>
                    {currentStatus === 'paid' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => updateStatus(orderId, 'Accepted')} style={actionBtn(BrandColors.primary)}>Accept</button>
                        <button onClick={() => updateStatus(orderId, 'Rejected')} style={actionBtn(BrandColors.danger)}>Reject</button>
                      </div>
                    )}
                    {currentStatus === 'accepted' && (
                      <button onClick={() => updateStatus(orderId, 'Shipped')} style={actionBtn('#3b82f6')}>Ship Now</button>
                    )}
                    {currentStatus === 'shipped' && (
                      <button onClick={() => updateStatus(orderId, 'Delivered')} style={actionBtn(BrandColors.primary)}>Deliver</button>
                    )}
                    {currentStatus === 'delivered' && <span style={{ color: BrandColors.primary, fontWeight: '700', fontSize: '12px' }}>Completed</span>}
                    {currentStatus === 'pending' && <span style={{ color: '#94a3b8', fontSize: '12px' }}>Waiting Payment</span>}
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No orders currently listed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SellerWallet = ({ config }) => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [payoutData, setPayoutData] = useState({ amount: '', bank: 'CBE' });

  useEffect(() => {
    api.get('/seller/stats')
      .then(res => { setBalance(res.data.walletBalance); setHistory(res.data.withdrawHistory || []); })
      .catch(err => console.log(err));
  }, [config]);

  const handlePayout = async (e) => {
    e.preventDefault();
    if (parseFloat(payoutData.amount) > balance) return toast.error("Insufficient funds");
    try {
      await api.post('/seller/payout', { amount: payoutData.amount });
      showSuccessToast("Payout request submitted!");
      setShowModal(false);
    } catch (err) { toast.error("Request failed"); }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ ...glassCard, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ opacity: 0.7, fontSize: '14px', margin: '0 0 10px 0' }}>Available Balance</p>
            <h1 style={{ fontSize: '48px', fontWeight: '900', margin: 0 }}>ETB {balance.toLocaleString()}</h1>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px' }}>
            <Wallet size={32} color={BrandColors.primary} />
          </div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ marginTop: '30px', width: '100%', padding: '16px', background: BrandColors.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
          Request Payout to Bank
        </button>
      </div>

      <div style={{ ...glassCard, marginTop: '30px' }}>
        <h3 style={{ marginBottom: '20px' }}>Payout Activity</h3>
        {history.length > 0 ? history.map((h, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>Withdrawal Request</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{h.date}</p>
            </div>
            <strong style={{ color: BrandColors.danger }}>- ETB {h.amount}</strong>
          </div>
        )) : <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No withdrawal history yet.</p>}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div style={{ ...glassCard, width: '400px' }}>
            <h3 style={{ marginTop: 0 }}>Withdraw Funds</h3>
            <form onSubmit={handlePayout}>
              <label style={labelStyle}>Amount (ETB)</label>
              <input type="number" required style={inputStyle} value={payoutData.amount} onChange={e => setPayoutData({ ...payoutData, amount: e.target.value })} />
              <label style={labelStyle}>Bank Account</label>
              <select style={inputStyle} value={payoutData.bank} onChange={e => setPayoutData({ ...payoutData, bank: e.target.value })}>
                <option value="CBE">Commercial Bank (CBE)</option>
                <option value="Abyssinia">Bank of Abyssinia</option>
                <option value="Telebirr">Telebirr</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: BrandColors.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700' }}>Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ManageProducts = ({ config, products, fetchProducts }) => {
  const [prods, setProds] = useState(products || []);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => { if (products) setProds(products); }, [products]);

  const del = async (id) => {
    if (window.confirm("Delete this product permanently?")) {
      try {
        await api.delete(`/seller/products/${id}`);
        setProds(prev => prev.filter(p => p.id !== id));
        if (fetchProducts) fetchProducts();
        showSuccessToast("Product removed");
      } catch (err) { toast.error("Delete failed"); }
    }
  };

  const saveChanges = async () => {
    try {
      const updateData = {
        name: editingProduct.name,
        description: editingProduct.description,
        category_id: editingProduct.category_id,
        base_price: Number(editingProduct.base_price),
        stock_quantity: Number(editingProduct.stock_quantity),
        variants: [{ sku: editingProduct.sku || "", size: editingProduct.size || "", color: editingProduct.color || "", price: Number(editingProduct.base_price), stock_quantity: Number(editingProduct.stock_quantity) }]
      };
     await api.put(`/seller/products/${editingProduct.id}`, updateData);
      showSuccessToast("Product updated");
      setEditingProduct(null);
      if (fetchProducts) fetchProducts();
    } catch (err) { toast.error("Update failed"); }
  };

  return (
    <div style={glassCard}>
      <h2 style={{ marginBottom: '25px', fontWeight: '800' }}>Inventory Control</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Stock</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {prods.map(p => {
              let displayImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}`;
              try {
                const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
                if (Array.isArray(parsed) && parsed[0]) {
                  displayImage = parsed[0].startsWith('http') 
  ? parsed[0] 
  : `${process.env.REACT_APP_BASE_URL}/${parsed[0].replace(/^\/+/, '')}`;
                }
              } catch (e) {}

              return (
                <tr key={p.id}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={displayImage} alt="" style={{ width: '45px', height: '45px', borderRadius: '10px', objectFit: 'cover' }} />
                      <span style={{ fontWeight: '600' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>{p.category_name}</td>
                  <td style={tdStyle}>ETB {p.base_price}</td>
                  <td style={tdStyle}>
                    <span style={{ color: p.stock_quantity < 5 ? BrandColors.danger : 'inherit', fontWeight: p.stock_quantity < 5 ? '800' : '400' }}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setEditingProduct({ ...p, stock_quantity: p.stock_quantity || 0 })} style={actionBtn(BrandColors.primary)}>Edit</button>
                      <button onClick={() => del(p.id)} style={{ color: BrandColors.danger, background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ ...glassCard, width: '450px' }}>
            <h3>Update Product</h3>
            <label style={labelStyle}>Product Name</label>
            <input style={inputStyle} value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} />
            <label style={labelStyle}>Base Price (ETB)</label>
            <input type="number" style={inputStyle} value={editingProduct.base_price} onChange={e => setEditingProduct({ ...editingProduct, base_price: e.target.value })} />
            <label style={labelStyle}>Stock Quantity</label>
            <input type="number" style={inputStyle} value={editingProduct.stock_quantity} onChange={e => setEditingProduct({ ...editingProduct, stock_quantity: e.target.value })} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEditingProduct(null)} style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '8px' }}>Cancel</button>
              <button onClick={saveChanges} style={{ flex: 1, padding: '12px', background: BrandColors.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AddProductForm = ({ config, refreshProducts }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);
const [attributeValues, setAttributeValues] = useState({});
const [selectedValues, setSelectedValues] = useState([]);
  
  // State for dynamic variants
  const [variants, setVariants] = useState([
    { size: '', color: '', stock_quantity: 0 }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    discountPrice: '',
    stock: '',
    description: '',
    brand: '',
    sku: '',
    image: null
  });

  // Fetch Categories and Brands for the dropdowns
 useEffect(() => {

  api.get("/categories").then(res => {
    if (res.data.success) setCategories(res.data.data);
  });

  api.get("/brands").then(res => {
    if (res.data.success) setBrands(res.data.data);
  });

  api.get("/attributes").then(res => {
    if (res.data.success) {
      setAttributes(res.data.data);

      res.data.data.forEach(attr => {
       api.get(`/attributes/value/${attr.id}`)
          .then(v => {
            setAttributeValues(prev => ({
              ...prev,
              [attr.id]: v.data.data
            }));
          });
      });
    }
  });

}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      
      // Basic Fields
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("category_id", formData.category);
      form.append("base_price", Number(formData.price));
      form.append("discount_price", formData.discountPrice || "");
      form.append("brand_id", formData.brand);
      form.append("stock_quantity", Number(formData.stock));
      form.append("sku", formData.sku);

      if (formData.image) form.append("images", formData.image);

      // Append Variants as JSON string
form.append(
  "variants",
  JSON.stringify(
    variants.map((v, i) => ({
      sku: formData.sku || `VAR-${i + 1}`,
      price: Number(formData.price),
      stock_quantity: Number(v.stock_quantity || formData.stock || 0)
    }))
  )
);

form.append("attribute_values", JSON.stringify(selectedValues));

      await api.post("/seller/products", form);

      showSuccessToast("Product submitted successfully!");
      
      // Reset form
      setFormData({ name: '', category: '', price: '', discountPrice: '', stock: '', description: '', brand: '', sku: '', image: null });
      setVariants([{ size: '', color: '', stock_quantity: 0 }]);
      
      if (refreshProducts) refreshProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ ...glassCard, maxWidth: '750px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '25px', fontWeight: '800' }}>List New Product</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Product Title</label>
          <input required style={inputStyle} value={formData.name} 
            onChange={e => setFormData({ ...formData, name: e.target.value })} 
            placeholder="e.g. Wireless Noise Cancelling Headphones" />
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <select style={inputStyle} value={formData.category} 
            onChange={e => setFormData({ ...formData, category: e.target.value })}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Brand</label>
          <select style={inputStyle} value={formData.brand} 
            onChange={e => setFormData({ ...formData, brand: e.target.value })}>
            <option value="">Select Brand (Optional)</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Price (ETB)</label>
          <input type="number" required style={inputStyle} value={formData.price} 
            onChange={e => setFormData({ ...formData, price: e.target.value })} />
        </div>

        <div>
          <label style={labelStyle}>Discount Price</label>
          <input type="number" style={inputStyle} value={formData.discountPrice} 
            onChange={e => setFormData({ ...formData, discountPrice: e.target.value })} />
        </div>

        <div>
          <label style={labelStyle}>Base Stock</label>
          <input type="number" required style={inputStyle} value={formData.stock} 
            onChange={e => setFormData({ ...formData, stock: e.target.value })} />
        </div>

        <div>
          <label style={labelStyle}>SKU</label>
          <input type="text" style={inputStyle} value={formData.sku} 
            onChange={e => setFormData({ ...formData, sku: e.target.value })} placeholder="ELEC-001" />
        </div>
      </div>

      {/* VARIANTS SECTION */}
  <div style={{ marginTop: "20px" }}>
  <label style={labelStyle}>Attributes</label>

  {attributes.map(attr => (
    <div key={attr.id} style={{ marginBottom: "15px" }}>

      <strong>{attr.name}</strong>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>

        {(attributeValues[attr.id] || []).map(val => (
          <label key={val.id} style={{ fontSize: "13px" }}>
            <input
              type="checkbox"
              value={val.id}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedValues(prev => [...prev, val.id]);
                } else {
                  setSelectedValues(prev => prev.filter(v => v !== val.id));
                }
              }}
            />

            {val.value}

          </label>
        ))}

      </div>

    </div>
  ))}
</div>
{/* VARIANT STOCK */}
<div style={{ marginTop: "20px" }}>

  <label style={labelStyle}>Variant Stock</label>

  {variants.map((v, index) => (

    <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>

      <input
        type="number"
        placeholder={`Stock for Variant ${index + 1}`}
        value={v.stock_quantity}
        onChange={(e) => {
          const newVariants = [...variants];
          newVariants[index].stock_quantity = e.target.value;
          setVariants(newVariants);
        }}
        style={inputStyle}
      />

    </div>

  ))}

</div>

      <label style={labelStyle}>Description</label>
      <textarea rows="4" style={{ ...inputStyle, height: '100px', resize: 'none' }} 
        value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />

      <label style={labelStyle}>Product Image</label>
      <div style={{ border: '2px dashed #e2e8f0', padding: '20px', borderRadius: '12px', textAlign: 'center', background: '#f8fafc', marginBottom: '20px' }}>
        <input type="file" onChange={e => setFormData({ ...formData, image: e.target.files[0] })} />
      </div>

      <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', background: BrandColors.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
        {loading ? "Processing..." : "Submit for Review"}
      </button>
    </form>
  );
};

const SellerFullSettings = () => {
  const { user, token, login } = useAuth();
  const [subTab, setSubTab] = useState('profile');
  const [formData, setFormData] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('address', formData.address);

    try {
      const res = await api.put('/auth/profile', data);
      if (res.data.success) {
        login(token, res.data.user); // This updates the global state!
        toast.success("Profile updated successfully!");
      }
    } catch (err) { toast.error("Failed to update profile."); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return toast.error("Passwords don't match");
    try {
      await api.put('/auth/change-password', { currentPassword: passData.current, newPassword: passData.new });
      toast.success("Password updated!");
      setPassData({ current: '', new: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
  };

  return (
    <div style={{ ...glassCard, display: 'flex', padding: 0, overflow: 'hidden', minHeight: '500px' }}>
      <div style={{ width: '220px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '20px 10px' }}>
        <div onClick={() => setSubTab('profile')} style={{ padding: '12px 20px', cursor: 'pointer', borderRadius: '10px', color: subTab === 'profile' ? BrandColors.primary : '#64748b', background: subTab === 'profile' ? 'white' : 'transparent', fontWeight: '700', display: 'flex', gap: '10px', marginBottom: '5px' }}>
          <User size={18}/> Profile
        </div>
        <div onClick={() => setSubTab('security')} style={{ padding: '12px 20px', cursor: 'pointer', borderRadius: '10px', color: subTab === 'security' ? BrandColors.primary : '#64748b', background: subTab === 'security' ? 'white' : 'transparent', fontWeight: '700', display: 'flex', gap: '10px' }}>
          <Lock size={18}/> Security
        </div>
      </div>
      
      <div style={{ flex: 1, padding: '40px' }}>
        {subTab === 'profile' ? (
          <form onSubmit={handleUpdateProfile}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>General Settings</h3>
            <label style={labelStyle}>Full Name</label>
            <input style={inputStyle} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <label style={labelStyle}>Phone Number</label>
            <input style={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <label style={labelStyle}>Business Address</label>
            <textarea style={{ ...inputStyle, height: '80px' }} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            <button type="submit" style={actionBtn(BrandColors.primary)}>Save Changes</button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Security</h3>
            <label style={labelStyle}>Current Password</label>
            <input type="password" style={inputStyle} value={passData.current} onChange={e => setPassData({...passData, current: e.target.value})} />
            <label style={labelStyle}>New Password</label>
            <input type="password" style={inputStyle} value={passData.new} onChange={e => setPassData({...passData, new: e.target.value})} />
            <label style={labelStyle}>Confirm New Password</label>
            <input type="password" style={inputStyle} value={passData.confirm} onChange={e => setPassData({...passData, confirm: e.target.value})} />
            <button type="submit" style={actionBtn(BrandColors.primary)}>Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD SHELL ---
const SellerDash = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'overview');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "", businessName: user?.business_name || "", phone: user?.phone || "", profilePic: user?.profile_pic || null, address: user?.address || "" });
  const [products, setProducts] = useState([]);

  const config = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);
 const fetchProducts = useCallback(async () => {
  if (!user?.id) return;

  try {
    const res = await api.get('/seller/inventory');
    setProducts(
      Array.isArray(res.data.inventory)
        ? res.data.inventory
        : res.data || []
    );
  } catch (err) {
    console.error(err);
  }
}, [user?.id]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { localStorage.setItem('activeTab', activeTab); }, [activeTab]);

  const handleLogout = () => { if (window.confirm("Logout from Seller Panel?")) { logout(); navigate('/login'); } };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      {/* SIDEBAR */}
<aside style={{ 
  width: isSidebarOpen ? '260px' : '85px', 
  background: BrandColors.sidebarBg, 
  color: 'white', 
  height: '100vh', 
  position: 'sticky', 
  top: 0,
  transition: 'width 0.3s ease',
  display: 'flex',
  flexDirection: 'column'
}}>
  {/* Floating Toggle Button (Image 2 Style) */}
  <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={toggleBtnStyle}>
    {isSidebarOpen ? <ChevronRight size={14} style={{transform: 'rotate(180deg)'}}/> : <ChevronRight size={14}/>}
  </button>

  {/* Logo Section */}
  <div style={{ padding: '25px', display: 'flex', alignItems: 'center', gap: '12px' }}>
    <div style={{ background: BrandColors.primary, minWidth: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>
      E
    </div>
    {isSidebarOpen && <span style={{ fontWeight: '800', fontSize: '18px' }}>EthMarket <br/><small style={{fontSize: '10px', opacity: 0.5}}>SELLER PORTAL</small></span>}
  </div>

  {/* Sidebar Links */}
  <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
    {isSidebarOpen && <p style={sidebarLabel}>Dashboard</p>}
    <div onClick={() => setActiveTab('overview')} style={menuItemStyle(activeTab === 'overview')}>
      <LayoutDashboard size={18}/> {isSidebarOpen && 'Dashboard'}
    </div>

    {isSidebarOpen && <p style={sidebarLabel}>Management</p>}
    <div onClick={() => setActiveTab('add-product')} style={menuItemStyle(activeTab === 'add-product')}>
      <PackagePlus size={18}/> {isSidebarOpen && 'Add Product'}
    </div>
    <div onClick={() => setActiveTab('manage-products')} style={menuItemStyle(activeTab === 'manage-products')}>
      <ShoppingBag size={18}/> {isSidebarOpen && 'Inventory'}
    </div>

    {isSidebarOpen && <p style={sidebarLabel}>Sales</p>}
    <div onClick={() => setActiveTab('orders')} style={menuItemStyle(activeTab === 'orders')}>
      <ListOrdered size={18}/> {isSidebarOpen && 'Orders'}
    </div>
    <div onClick={() => setActiveTab('wallet')} style={menuItemStyle(activeTab === 'wallet')}>
      <Wallet size={18}/> {isSidebarOpen && 'Earnings'}
    </div>
  </div>

  {/* Bottom Section (Back to Shop & Logout) */}
  <div style={{ padding: '20px 15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
    {/* Real Back to Shop Link */}
    <div onClick={() => navigate('/')} style={menuItemStyle(false)}>
      <ChevronRight size={18} style={{transform: 'rotate(180deg)'}}/> {isSidebarOpen && 'Back to Shop'}
    </div>
    
    {/* Logout Icon at the very bottom */}
    <button onClick={handleLogout} style={{ 
      width: '40px', height: '40px', borderRadius: '10px', 
      background: 'rgba(255,255,255,0.05)', border: 'none', 
      color: '#94a3b8', cursor: 'pointer', marginTop: '10px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginLeft: isSidebarOpen ? '15px' : '7px'
    }}>
      <LogOut size={18}/>
    </button>
  </div>
</aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
<header style={{ 
  height: '70px', background: 'white', borderBottom: '1px solid #e2e8f0', 
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
  padding: '0 30px', position: 'sticky', top: 0, zIndex: 100 
}}>
  <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>
    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
  </h1>

  <div style={{ position: 'relative' }}>
    <div 
      onClick={() => setIsProfileOpen(!isProfileOpen)}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '10px', 
        padding: '6px 14px', borderRadius: '30px', border: '1px solid #e2e8f0', 
        cursor: 'pointer', background: '#f8fafc', transition: '0.2s'
      }}
    >
      {/* Dynamic Profile Image from AuthContext */}
      {user?.profile_pic ? (
<img 
  src={
    user?.profile_pic?.startsWith('http')
      ? user.profile_pic
      : `${process.env.REACT_APP_API_URL.replace('/api', '')}/${user.profile_pic}`
  }
  alt="Profile"
  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
/>
      ) : (
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: BrandColors.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
          {user?.name?.charAt(0)}
        </div>
      )}
      <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{user?.name}</span>
      <ChevronRight size={16} style={{ transform: isProfileOpen ? 'rotate(-90deg)' : 'rotate(90deg)', transition: '0.2s', color: '#64748b' }} />
    </div>

    {/* Dropdown Menu - Simplified for Dashboard */}
    {isProfileOpen && (
      <div style={{ 
        position: 'absolute', top: '55px', right: 0, width: '180px', 
        background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
        border: '1px solid #f1f5f9', zIndex: 1000, overflow: 'hidden', padding: '6px'
      }}>
        <div 
          onClick={() => { setActiveTab('settings'); setIsProfileOpen(false); }}
          style={{ 
            padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', 
            cursor: 'pointer', borderRadius: '10px', fontSize: '14px', color: '#475569'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Settings size={16} /> Settings
        </div>

        <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 8px' }} />

        <div 
          onClick={handleLogout}
          style={{ 
            padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', 
            cursor: 'pointer', borderRadius: '10px', fontSize: '14px', color: '#ef4444'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} /> Sign Out
        </div>
      </div>
    )}
  </div>
</header>

<main style={{ 
  flex: 1, 
  padding: '40px', 
  overflowY: 'auto', 
  background: '#f8fafc',
  minHeight: 'calc(100vh - 70px)' // Adjusts height based on your header
}}>
  {/* Content Container to keep things centered and neat */}
  <div style={{ 
    maxWidth: '1200px', 
    margin: '0 auto',
    animation: 'fadeIn 0.4s ease-in-out' // Smooth transition when switching tabs
  }}>
    
    {activeTab === 'overview' && <SellerOverview config={config} />}
    
    {activeTab === 'add-product' && <AddProductForm config={config} refreshProducts={fetchProducts} />}
    
    {activeTab === 'manage-products' && <ManageProducts config={config} products={products} fetchProducts={fetchProducts} />}
    
    {activeTab === 'orders' && <SellerOrders config={config} />}
    
    {activeTab === 'wallet' && <SellerWallet config={config} />}
    
    {/* This connects to your Profile Dropdown 'Settings' click */}
    {activeTab === 'settings' && (
      <SellerFullSettings 
        profile={profile} 
        setProfile={setProfile} 
        config={config} 
      />
    )}
  </div>
</main>      </div>
    </div>
  );
};

export default SellerDash;