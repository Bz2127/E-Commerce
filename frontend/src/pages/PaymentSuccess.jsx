import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, ShoppingBag, ArrowRight } from "lucide-react";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get("status");
  const trx_ref = searchParams.get("trx_ref");

  useEffect(() => {
    if (status === "success") {
      // Clear cart from storage
      localStorage.removeItem("cart");
      
      
      const timer = setTimeout(() => {
        navigate(`/order-success?trx_ref=${trx_ref}`);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [status, trx_ref, navigate]);

  return (
    <div style={container}>
      <div style={card}>
        {status === "success" ? (
          <>
            <div style={iconWrapperSuccess}>
              <CheckCircle size={60} color="#10b981" />
            </div>
            <h1 style={title}>Payment Received!</h1>
            <p style={text}>
              Your transaction was successful. We are generating your receipt and redirecting you now...
            </p>
            <div style={loaderBar}>
              <div style={loaderProgress}></div>
            </div>
          </>
        ) : (
          <>
            <div style={iconWrapperError}>
              <XCircle size={60} color="#ef4444" />
            </div>
            <h1 style={{ ...title, color: '#ef4444' }}>Payment Failed</h1>
            <p style={text}>
              Something went wrong with your transaction. Please try again or contact support.
            </p>
          </>
        )}

        <div style={btnGroup}>
          <button onClick={() => navigate("/")} style={btnSecondary}>
            <ShoppingBag size={18} /> Back to Shop
          </button>
          {status === "success" && (
            <button 
              onClick={() => navigate(`/order-success?trx_ref=${trx_ref}`)} 
              style={btnPrimary}
            >
              View Receipt <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --- STYLES ---
const container = { 
  display: 'flex', justifyContent: 'center', alignItems: 'center', 
  minHeight: '100vh', background: '#f8fafc', padding: '20px', fontFamily: "'Inter', sans-serif" 
};
const card = { 
  background: 'white', padding: '50px 40px', borderRadius: '32px', 
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center', 
  maxWidth: '500px', width: '100%', border: '1px solid #f1f5f9' 
};
const iconWrapperSuccess = { 
  background: '#f0fdf4', width: '100px', height: '100px', borderRadius: '50%', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
};
const iconWrapperError = { 
  background: '#fef2f2', width: '100px', height: '100px', borderRadius: '50%', 
  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
};
const title = { fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', letterSpacing: '-1px' };
const text = { color: '#64748b', lineHeight: '1.6', marginBottom: '30px', fontSize: '16px' };
const loaderBar = { width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '30px' };
const loaderProgress = { 
  width: '60%', height: '100%', background: '#10b981', borderRadius: '10px', 
  animation: 'loadingMove 2s infinite ease-in-out' 
};
const btnGroup = { display: 'flex', gap: '12px', justifyContent: 'center' };
const btnPrimary = { 
  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
  background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', 
  fontWeight: '700', cursor: 'pointer', transition: '0.2s' 
};
const btnSecondary = { 
  display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
  background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', 
  fontWeight: '700', cursor: 'pointer' 
};


const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes loadingMove {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }
`;
document.head.appendChild(styleSheet);

export default PaymentSuccess;