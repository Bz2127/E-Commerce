import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { CreditCard, Hash, User, Calendar, CheckCircle, Clock, XCircle, Activity, Search, Download, FileText, Table as TableIcon } from "lucide-react";

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- LOGIC: SEARCH & CALENDAR STATES ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/admin/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // --- LOGIC: FILTERING ---
  const filteredData = transactions.filter((t) => {
    const matchesSearch = 
      t.order_id.toString().includes(searchTerm) || 
      t.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = selectedDate 
      ? new Date(t.created_at).toLocaleDateString() === new Date(selectedDate).toLocaleDateString() 
      : true;

    return matchesSearch && matchesDate;
  });

  // --- EXPORT FUNCTIONS ---
  const exportToExcel = () => {
    const headers = ["ID,Order ID,User,Amount,Method,Status,Date\n"];
    const rows = filteredData.map(t => 
      `${t.id},${t.order_id},${t.user_name},${t.amount},${t.method || 'Chapa'},${t.status},${new Date(t.created_at).toLocaleDateString()}`
    );
    const blob = new Blob([headers + rows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EthMarket_Transactions.csv`;
    a.click();
  };

  const exportToPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#64748b' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '3px solid #f1f5f9', borderTopColor: '#10b981', borderRadius: '50%', marginBottom: '15px' }}></div>
        <p style={{ fontWeight: '600' }}>Loading transactions...</p>
      </div>
    );
  }

  return (
    <div style={brandStyles.container}>
      {/* BRANDED HEADER */}
      <div style={brandStyles.header}>
        <div className="no-print">
          <h2 style={brandStyles.title}>
            <div style={brandStyles.iconBg}>
              <CreditCard size={24} color="white" />
            </div>
            Transaction Management
          </h2>
          <p style={brandStyles.subtitle}>Monitor financial flow and payment processing.</p>
        </div>
        <div style={brandStyles.headerActions} className="no-print">
          <div style={brandStyles.statusBadgeTop}>
            <Activity size={14} /> System Live
          </div>
          <div style={brandStyles.exportGroup}>
            <button onClick={exportToExcel} style={brandStyles.secondaryBtn}>
              <Download size={16} /> Excel
            </button>
            <button onClick={exportToPDF} style={brandStyles.primaryBtn}>
              <FileText size={16} /> PDF Report
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH & CALENDAR BAR */}
      <div style={brandStyles.toolbar} className="no-print">
        <div style={brandStyles.searchBox}>
          <Search size={18} style={brandStyles.inputIcon} />
          <input 
            style={brandStyles.input} 
            placeholder="Search Order ID or Customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={brandStyles.dateBox}>
          <Calendar size={18} style={brandStyles.inputIcon} />
          <input 
            type="date" 
            style={brandStyles.input} 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {selectedDate && <button onClick={() => setSelectedDate("")} style={brandStyles.clearBtn}>Reset</button>}
        </div>
      </div>

      {/* DATA TABLE */}
      <div style={brandStyles.card}>
        <table style={brandStyles.table}>
          <thead>
            <tr>
              <th style={brandStyles.th}><Hash size={14} /> ID</th>
              <th style={brandStyles.th}>Order</th>
              <th style={brandStyles.th}><User size={14} /> User</th>
              <th style={brandStyles.th}>Amount</th>
              <th style={brandStyles.th}><TableIcon size={14} /> Method</th>
              <th style={brandStyles.th}>Status</th>
              <th style={brandStyles.th}><Calendar size={14} /> Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.length === 0 ? (
              <tr><td colSpan="7" style={brandStyles.empty}>No results found.</td></tr>
            ) : (
              filteredData.map((t) => (
                <tr key={t.id} style={brandStyles.tr}>
                  <td style={brandStyles.td}><span style={{ fontWeight: '700' }}>{t.id}</span></td>
                  <td style={brandStyles.td}><span style={{ color: '#10b981', fontWeight: '600' }}>#{t.order_id}</span></td>
                  <td style={brandStyles.td}><div style={{ fontWeight: '600' }}>{t.user_name}</div></td>
                  <td style={brandStyles.td}><span style={{ fontWeight: '800' }}>{t.amount} <span style={{ fontSize: '10px', color: '#10b981' }}>ETB</span></span></td>
                  <td style={brandStyles.td}><div style={brandStyles.methodTag}>{t.method || "Chapa"}</div></td>
                  <td style={brandStyles.td}>
                    <span style={{
                      ...brandStyles.statusBadge,
                      background: t.status === "success" ? "#ecfdf5" : t.status === "pending" ? "#fffbeb" : "#fff1f2",
                      color: t.status === "success" ? "#065f46" : t.status === "pending" ? "#92400e" : "#9f1239",
                      border: `1px solid ${t.status === "success" ? "#d1fae5" : t.status === "pending" ? "#fef3c7" : "#ffe4e6"}`
                    }}>
                      {t.status === "success" && <CheckCircle size={12} style={{ marginRight: '4px' }} />}
                      {t.status === "pending" && <Clock size={12} style={{ marginRight: '4px' }} />}
                      {t.status === "failed" && <XCircle size={12} style={{ marginRight: '4px' }} />}
                      {t.status}
                    </span>
                  </td>
                  <td style={brandStyles.td}>{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          div { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
};

const brandStyles = {
  container: { padding: '40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  headerActions: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '15px' },
  subtitle: { color: '#64748b', margin: '8px 0 0 63px', fontSize: '15px' },
  iconBg: { backgroundColor: '#10b981', padding: '10px', borderRadius: '14px', display: 'flex' },
  statusBadgeTop: { backgroundColor: '#ecfdf5', color: '#10b981', padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: '6px' },
  exportGroup: { display: 'flex', gap: '10px' },
  primaryBtn: { backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  secondaryBtn: { backgroundColor: 'white', color: '#475569', border: '1px solid #e2e8f0', padding: '10px 18px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  toolbar: { display: 'flex', gap: '15px', marginBottom: '25px' },
  searchBox: { position: 'relative', flex: 2 },
  dateBox: { position: 'relative', flex: 1 },
  inputIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
  input: { width: '100%', padding: '12px 12px 12px 45px', borderRadius: '14px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '14px' },
  clearBtn: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: '#f1f5f9', border: 'none', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', padding: '4px 8px' },
  card: { backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "18px 20px", background: "#f8fafc", color: "#64748b", fontWeight: "700", fontSize: "12px", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "18px 20px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#475569" },
  statusBadge: { padding: "6px 12px", borderRadius: "100px", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", display: "inline-flex", alignItems: "center" },
  methodTag: { backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' },
  empty: { padding: "60px", textAlign: "center", color: "#94a3b8" }
};

export default TransactionManagement;