import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function PaymentPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>You must be logged in to make a payment. Please log in or create an account.</p>
      </div>
    );
  }

  async function handlePay() {
    try {
      setError(null);
      setLoading(true);

      // 1) Create order on backend
      const orderRes = await fetch(`${API_BASE_URL}/api/payment/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      const orderJson = await orderRes.json();

      if (!orderJson.ok) {
        throw new Error(orderJson.error || "Failed to create order");
      }

      const { order_id, amount, currency, key_id } = orderJson;

      // 2) Open Razorpay checkout
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "Tech Club - LeetCode Contest",
        description: "Registration Fee",
        order_id: order_id,
        prefill: {
          email: user.email || "",
        },
        theme: {
          color: "#673de6",
        },
        handler: async function (response) {
          // 3) Verify payment on backend
          try {
            const verifyRes = await fetch(
              `${API_BASE_URL}/api/payment/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  user_id: user.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyJson = await verifyRes.json();
            if (!verifyJson.ok) {
              throw new Error(
                verifyJson.error || "Payment verification failed"
              );
            }

            // Success: redirect to problems page
            navigate("/problems", { replace: true });
          } catch (err) {
            console.error("verify payment error:", err);
            setError(err.message || "Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("handlePay error:", err);
      setError(err.message || "Payment failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-[#111] p-6 rounded-xl w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold mb-2">Complete Registration</h1>
        <p className="text-sm text-gray-400">
          Pay <span className="font-semibold text-white">₹199</span> to unlock
          all contest problems and leaderboard access.
        </p>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
        >
          {loading ? "Processing..." : "Pay ₹200 with Razorpay"}
        </button>
      </div>
    </div>
  );
}
