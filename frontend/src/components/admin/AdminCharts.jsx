import React from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminCharts = ({ revenueData = [], orderData = [], topProducts = [] }) => {

  const revenueChart = {
    labels: (revenueData || []).map((r) => r.date),
    datasets: [
      {
        label: "Revenue",
        data: (revenueData || []).map((r) => r.revenue),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.2)",
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const orderChart = {
    labels: (orderData || []).map((o) => o.date),
    datasets: [
      {
        label: "Orders",
        data: (orderData || []).map((o) => o.orders),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        borderWidth: 3,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const topProductsChart = {
    labels: (topProducts || []).map((p) => p.name),
    datasets: [
      {
        label: "Top Selling Products",
        data: (topProducts || []).map((p) => p.total_sold),
        backgroundColor: "#f59e0b",
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top"
      },
      tooltip: {
        mode: "index",
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div style={containerStyle}>

      <div style={cardStyle}>
        <h3 style={titleStyle}>Revenue Analytics</h3>
        <div style={chartHeight}>
          <Line data={revenueChart} options={options} />
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={titleStyle}>Orders Analytics</h3>
        <div style={chartHeight}>
          <Line data={orderChart} options={options} />
        </div>
      </div>

      <div style={{ ...cardStyle, gridColumn: "span 2" }}>
        <h3 style={titleStyle}>Top Selling Products</h3>
        <div style={chartHeight}>
          <Bar data={topProductsChart} options={options} />
        </div>
      </div>

    </div>
  );
};

export default AdminCharts;


/* ------------------- STYLES ------------------- */

const containerStyle = {
  marginTop: "40px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
  gap: "30px"
};

const cardStyle = {
  background: "#ffffff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 6px 20px rgba(0,0,0,0.05)"
};

const titleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "15px",
  color: "#111827"
};

const chartHeight = {
  height: "300px"
};