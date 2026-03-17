import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ArrowLeft,
  AlertCircle,
  Menu,
  ShieldCheck,     
  PackageSearch,   
  Tags,            
  CheckSquare,     
  Image as ImageIcon,
  FileText,        
  CreditCard,      
  Layers,          
  ShoppingBag,     
  PieChart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminOverview from '../components/admin/AdminOverview';
import SellerApprovals from '../components/admin/SellerApprovals';
import UserManagement from '../components/admin/UserManagement';
import AdminCharts from "../components/admin/AdminCharts";
import api from "../utils/api";
import ProductModeration from "../components/admin/ProductModeration";
import OrderManagement from "../components/admin/OrderManagement";

import AttributeManagement from "../components/admin/AttributeManagement";
import BrandManagement from "../components/admin/BrandManagement";
import CategoryManagement from "../components/admin/CategoryManagement";
import BannerManagement from "../components/admin/BannerManagement";
import Reports from "../components/admin/Reports";
import TransactionManagement from "../components/admin/TransactionManagement";

const AdminDash = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true); // Initializing as true to handle auth check
  const [error, setError] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); 

  const [revenue, setRevenue] = useState(0);
  const [orders, setOrders] = useState(0);

  const [revenueData, setRevenueData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const [range, setRange] = useState("30days");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth(); 

  // Security and Navigation Check
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setError('Please login first');
      navigate('/login', { replace: true });
      return;
    }
    
    if (!isAdmin) {
      setError('Admin access required');
      navigate('/', { replace: true });
      return;
    }
    
    setLoading(false);
  }, [user, isAdmin, authLoading, navigate]);

  // Analytics Fetching
  useEffect(() => {
    if (!isAdmin || loading) return;

    const fetchAnalytics = async () => {
      try {
        const revenueRes = await api.get(`/admin/analytics/revenue?range=${range}`);
        const orderRes = await api.get(`/admin/analytics/orders?range=${range}`);
        const topRes = await api.get(`/admin/analytics/top-products?range=${range}`);

        const revenueJson = revenueRes.data || [];
        const orderJson = orderRes.data || [];
        const topJson = topRes.data || [];

        const totalRevenue = revenueJson.reduce((sum, r) => sum + Number(r.revenue || 0), 0);
        const totalOrders = orderJson.reduce((sum, o) => sum + Number(o.orders || 0), 0);

        setRevenue(totalRevenue);
        setOrders(totalOrders);
        setRevenueData(revenueJson);
        setOrderData(orderJson);
        setTopProducts(topJson);

      } catch (err) {
        console.error("Analytics load error:", err);
      }
    };

    fetchAnalytics();
  }, [isAdmin, range, loading]);

  if (loading || authLoading) {
    return (
      <div style={styles.loadingWrapper}>
        <div style={styles.loadingSpinner}>
          <LayoutDashboard size={48} color="#10b981" style={{ animation: 'pulse 1.5s infinite' }} />
          <p style={styles.loadingText}>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorWrapper}>
        <AlertCircle size={64} style={styles.errorIcon} />
        <h2 style={styles.errorTitle}>Access Denied</h2>
        <p style={styles.errorMsg}>{error}</p>
        <button onClick={() => navigate('/login')} style={styles.errorBtn}>
          Go to Login
        </button>
      </div>
    );
  }

  const menuSections = [
    {
      title: "Dashboard",
      items: [
        { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={20}/> }
      ]
    },
    {
      title: "Management",
      items: [
        { id: "approvals", label: "Seller Approvals", icon: <ShieldCheck size={20}/> },
        { id: "users", label: "User Management", icon: <Users size={20}/> }
      ]
    },
    {
      title: "Catalog",
      items: [
        { id: "products", label: "Product Moderation", icon: <PackageSearch size={20}/> },
        { id: "categories", label: "Categories", icon: <Layers size={20}/> },
        { id: "brands", label: "Brands", icon: <Tags size={20}/> },
        { id: "attributes", label: "Attributes", icon: <CheckSquare size={20}/> }
      ]
    },
    {
      title: "Sales",
      items: [
        { id: "orders", label: "Order Management", icon: <ShoppingBag size={20}/> },
        { id: "transactions", label: "Transactions", icon: <CreditCard size={20}/> }
      ]
    },
    {
      title: "Marketing",
      items: [
        { id: "banners", label: "Homepage Banners", icon: <ImageIcon size={20}/> }
      ]
    },
    {
      title: "Analytics",
      items: [
        { id: "reports", label: "Reports", icon: <FileText size={20}/> },
        { id: "analytics", label: "Analytics", icon: <PieChart size={20}/> }
      ]
    }
  ];

  return (
    <div style={styles.dashboardWrapper}>
      <aside
        style={{
          ...styles.sidebar,
          width: isSidebarCollapsed ? "80px" : "280px",
          transform: mobileMenuOpen ? "translateX(0)" : "",
        }}
      >
        <div style={styles.sidebarHeader}>
          {!isSidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={styles.logoBadge}>E</div>
              <div>
                <h2 style={styles.sidebarTitle}>
                  <span style={{ color: '#10b981' }}>Eth</span>Market
                </h2>
                <p style={styles.welcomeUser}>Admin Portal • {user?.name}</p>
              </div>
            </div>
          )}
          {isSidebarCollapsed && <div style={styles.logoBadge}>E</div>}
        </div>

        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          style={styles.sidebarToggleBtn}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <nav style={styles.navMenu}>
          {menuSections.map((section) => (
            <div key={section.title} style={styles.menuSection}>
              {!isSidebarCollapsed && <p style={styles.menuTitle}>{section.title}</p>}
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  title={isSidebarCollapsed ? item.label : ""}
                  style={{
                    ...styles.navItem,
                    ...(activeTab === item.id ? styles.activeNavItem : {}),
                    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'
                  }}
                >
                  <span style={activeTab === item.id ? styles.activeIcon : styles.icon}>
                    {item.icon}
                  </span>
                  {!isSidebarCollapsed && item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={() => navigate('/')} style={{...styles.backBtn, justifyContent: isSidebarCollapsed ? 'center' : 'flex-start'}}>
            <ArrowLeft size={16} /> {!isSidebarCollapsed && "Back to Shop"}
          </button>
        </div>
      </aside>

      {mobileMenuOpen && <div style={styles.overlay} onClick={() => setMobileMenuOpen(false)} />}

      <main style={{ 
        ...styles.mainContent, 
        marginLeft: isSidebarCollapsed ? '80px' : '280px' 
      }}>
        <header style={styles.contentHeader}>
          <div style={styles.headerLeft}>
            <button style={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} color="#1e293b" />
            </button>
            <div>
              <h1 style={styles.pageTitle}>
                {menuSections.flatMap(section => section.items).find(i => i.id === activeTab)?.label}
              </h1>
              <p style={styles.pageSubtitle}>Manage your marketplace operations and users.</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            <span style={styles.statusIndicator}>System Online</span>
          </div>
        </header>

        <section style={styles.renderArea}>
          <div style={styles.card}>
            {activeTab === 'overview' && <AdminOverview />}
            {activeTab === 'approvals' && <SellerApprovals />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'products' && <ProductModeration />}
            {activeTab === 'orders' && <OrderManagement />}
            {activeTab === 'categories' && <CategoryManagement />}
            {activeTab === 'brands' && <BrandManagement />}
            {activeTab === 'attributes' && <AttributeManagement />}
            {activeTab === 'banners' && <BannerManagement />}
            {activeTab === 'reports' && <Reports />}
            {activeTab === 'transactions' && <TransactionManagement />}

            {activeTab === 'analytics' && (
              <div style={{ padding: '10px 0' }}>
                <div style={styles.filterBar}>
                  <label style={{ fontWeight: "700", color: "#475569" }}>Time Range:</label>
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    style={styles.selectInput}
                  >
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                    <option value="12months">Last 12 Months</option>
                  </select>
                </div>

                <AdminCharts revenueData={revenueData} orderData={orderData} topProducts={topProducts} />
                
                <h3 style={styles.sectionTitle}>📊 Revenue & Orders Analytics</h3>
                
                <div style={styles.statsGrid}>
                  <div style={{ ...styles.statCard, borderLeft: '5px solid #10b981' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>{revenue.toLocaleString()} ETB</div>
                    <div style={styles.statLabel}>Total Revenue</div>
                    <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 'bold' }}>+15% Growth</div>
                  </div>
                  
                  <div style={{ ...styles.statCard, borderLeft: '5px solid #3b82f6' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6' }}>{orders}</div>
                    <div style={styles.statLabel}>Total Orders</div>
                    <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>+8% Performance</div>
                  </div>
                  
                  <div style={{ ...styles.statCard, borderLeft: '5px solid #f59e0b' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b' }}>0</div>
                    <div style={styles.statLabel}>Pending Payouts</div>
                    <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold' }}>Ready to process</div>
                  </div>
                </div>

                <div style={styles.tableCard}>
                  <h4 style={styles.tableTitle}>📈 Top Products (Last {range})</h4>
                  <div style={{ marginTop: '15px' }}>
                    {topProducts.map((p) => (
                      <div key={p.id} style={styles.listItem}>
                        <span style={{ fontWeight: '500' }}>{p.name}</span>
                        <span style={styles.badgeSuccess}>{p.total_sold} sold</span>
                      </div>
                    ))}
                  </div>
                  <button style={styles.primaryBtn}>View Full Report →</button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

// --- STYLES (As provided by you) ---
const styles = {
  dashboardWrapper: { display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Inter', sans-serif" },
  sidebar: {
    height: "100vh", background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", color: "white", 
    display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0, zIndex: 1000, 
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "4px 0 24px rgba(0,0,0,0.1)",
  },
  sidebarToggleBtn: {
    position: 'absolute', right: '-12px', top: '40px', width: '24px', height: '24px', borderRadius: '50%',
    backgroundColor: '#10b981', border: 'none', color: 'white', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 1001
  },
  sidebarHeader: { padding: '32px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  logoBadge: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', minWidth: '40px', height: '40px',
    borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900',
    fontSize: '20px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  sidebarTitle: { fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
  welcomeUser: { fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0', textTransform: 'uppercase', fontWeight: '600' },
  navMenu: { padding: '20px 16px', flex: 1, overflowY: 'auto' },
  menuSection: { marginBottom: "24px" },
  menuTitle: { fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.2px", color: "#475569", margin: "0 12px 10px 12px", fontWeight: "800" },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px 14px', margin: '2px 0',
    border: 'none', borderRadius: '8px', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer',
    textAlign: 'left', fontSize: '14px', fontWeight: '500', transition: '0.2s', overflow: 'hidden', whiteSpace: 'nowrap'
  },
  activeNavItem: { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: '600' },
  icon: { color: '#64748b', transition: '0.2s', minWidth: '20px' },
  activeIcon: { color: '#10b981', minWidth: '20px' },
  sidebarFooter: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', 
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
    borderRadius: '10px', color: '#cbd5e1', cursor: 'pointer', fontSize: '13px'
  },
  mainContent: { flex: 1, padding: '40px', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
  contentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
  headerLeft: { display: "flex", alignItems: "center", gap: "16px" },
  mobileMenuBtn: { display: 'none', background: "white", border: "none", cursor: "pointer", padding: "8px", borderRadius: "8px" },
  pageTitle: { fontSize: '32px', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-1px' },
  pageSubtitle: { color: '#64748b', margin: '4px 0 0 0', fontSize: '15px' },
  statusIndicator: { fontSize: '12px', background: '#dcfce7', color: '#15803d', padding: '6px 16px', borderRadius: '30px', fontWeight: '700', border: '1px solid #b9f6ca' },
  card: { background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', minHeight: '500px', border: '1px solid #e2e8f0' },
  filterBar: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', background: '#f8fafc', padding: '15px', borderRadius: '12px' },
  selectInput: { padding: "10px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", fontSize: "14px", fontWeight: "600", color: "#1e293b" },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' },
  statCard: { padding: '28px', background: '#ffffff', borderRadius: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' },
  statLabel: { fontSize: '13px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', margin: '10px 0 4px 0' },
  tableCard: { background: '#f8fafc', padding: '30px', borderRadius: '20px', border: '1px solid #e2e8f0' },
  tableTitle: { fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 },
  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', background: 'white', borderRadius: '14px', marginBottom: '12px' },
  badgeSuccess: { background: '#ecfdf5', color: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  primaryBtn: { padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', marginTop: '20px' },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 900, backdropFilter: 'blur(4px)' },
  loadingWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' },
  loadingSpinner: { textAlign: 'center' },
  loadingText: { marginTop: '20px', fontSize: '18px', fontWeight: '600', color: '#475569' },
  errorWrapper: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' },
  errorIcon: { color: '#ef4444' },
  errorTitle: { fontSize: '28px', fontWeight: '800', margin: '10px 0' },
  errorBtn: { background: '#1e293b', color: 'white', padding: '12px 30px', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default AdminDash;