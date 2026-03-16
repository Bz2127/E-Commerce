import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Reports = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const salesRes = await api.get("/admin/reports/sales");
      const productRes = await api.get("/admin/reports/product-performance");
      const sellerRes = await api.get("/admin/reports/seller-performance");

      setSales(salesRes.data || []);
      setProducts(productRes.data || []);
      setSellers(sellerRes.data || []);
    } catch (err) {
      console.error("Report fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // EXPORT EXCEL
  // ==============================
  const exportExcel = () => {
    const workbook = XLSX.utils.book_new();
    const salesSheet = XLSX.utils.json_to_sheet(sales);
    const productSheet = XLSX.utils.json_to_sheet(products);
    const sellerSheet = XLSX.utils.json_to_sheet(sellers);

    XLSX.utils.book_append_sheet(workbook, salesSheet, "Sales Report");
    XLSX.utils.book_append_sheet(workbook, productSheet, "Product Performance");
    XLSX.utils.book_append_sheet(workbook, sellerSheet, "Seller Performance");

    XLSX.writeFile(workbook, "EthMarket_Reports.xlsx");
  };

  // ==============================
  // EXPORT PDF
  // ==============================
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("EthMarket Business Report", 14, 15);
    
    doc.setFontSize(12);
    doc.text("Sales Overview", 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [["Date", "Orders", "Revenue (ETB)"]],
      body: sales.map((s) => [new Date(s.date).toLocaleDateString(), s.orders, s.revenue]),
    });

    doc.addPage();
    doc.text("Product Performance", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Product Name", "Units Sold", "Total Revenue"]],
      body: products.map((p) => [p.name, p.total_sold, p.revenue]),
    });

    doc.addPage();
    doc.text("Seller Performance", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Business Name", "Orders Handled", "Earnings"]],
      body: sellers.map((s) => [s.seller_name, s.orders, s.revenue]),
    });

    doc.save("EthMarket_Full_Report.pdf");
  };

  if (loading) {
    return <div style={styles.loading}>Generating Report Data...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerSection}>
        <div>
          <h2 style={styles.title}>📊 Reports</h2>
          <p style={styles.subtitle}>Review your marketplace performance and export data.</p>
        </div>
        <div style={styles.btnGroup}>
          <button onClick={exportExcel} style={styles.btnExcel}>Export Excel</button>
          <button onClick={exportPDF} style={styles.btnPdf}>Export PDF</button>
        </div>
      </div>

      {/* --- SALES REPORT --- */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Sales Report (Last 30 Days)</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Orders</th>
              <th style={styles.th}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? sales.map((s, i) => (
              <tr key={i} style={styles.tr}>
                <td style={styles.td}>{new Date(s.date).toLocaleDateString()}</td>
                <td style={styles.td}>{s.orders}</td>
                <td style={styles.td}><strong>{parseFloat(s.revenue).toLocaleString()} ETB</strong></td>
              </tr>
            )) : <tr><td colSpan="3" style={styles.empty}>No sales data found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* --- PRODUCT PERFORMANCE --- */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Product Performance</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Total Sold</th>
              <th style={styles.th}>Revenue Generated</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map((p) => (
              <tr key={p.id} style={styles.tr}>
                <td style={styles.td}>{p.name}</td>
                <td style={styles.td}>{p.total_sold} units</td>
                <td style={styles.td}><strong>{parseFloat(p.revenue).toLocaleString()} ETB</strong></td>
              </tr>
            )) : <tr><td colSpan="3" style={styles.empty}>No product data found</td></tr>}
          </tbody>
        </table>
      </div>

      {/* --- SELLER PERFORMANCE --- */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Seller Performance</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Seller Business</th>
              <th style={styles.th}>Total Orders</th>
              <th style={styles.th}>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {sellers.length > 0 ? sellers.map((s) => (
              <tr key={s.seller_id} style={styles.tr}>
                <td style={styles.td}>{s.seller_name}</td>
                <td style={styles.td}>{s.orders}</td>
                <td style={styles.td}><strong>{parseFloat(s.revenue).toLocaleString()} ETB</strong></td>
              </tr>
            )) : <tr><td colSpan="3" style={styles.empty}>No seller data found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "20px", backgroundColor: "#f8fafc", minHeight: "100vh" },
  headerSection: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" },
  title: { margin: 0, color: "#1e293b", fontSize: "24px" },
  subtitle: { margin: "5px 0 0", color: "#64748b", fontSize: "14px" },
  btnGroup: { display: "flex", gap: "10px" },
  btnExcel: { padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  btnPdf: { padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  card: { background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", marginBottom: "30px" },
  cardTitle: { marginTop: 0, marginBottom: "20px", fontSize: "18px", color: "#334155", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px", background: "#f1f5f9", color: "#475569", fontWeight: "600", fontSize: "13px" },
  td: { padding: "16px 12px", borderBottom: "1px solid #f1f5f9", fontSize: "14px", color: "#334155" },
  tr: { transition: "background 0.2s" },
  empty: { textAlign: "center", padding: "30px", color: "#94a3b8" },
  loading: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "18px", color: "#64748b" }
};

export default Reports;