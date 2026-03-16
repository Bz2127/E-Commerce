import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get("status");

    if (status === "success") {
      // clear cart
      localStorage.removeItem("cart");

      // optional: show success message
      alert("Payment Successful! Your order has been placed.");
    } else {
      alert("Payment failed or cancelled.");
    }
  }, [searchParams]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Payment Successful 🎉</h1>
      <p>Your order has been placed successfully.</p>

      <button onClick={() => navigate("/")}>
        Continue Shopping
      </button>
    </div>
  );
}

export default PaymentSuccess;