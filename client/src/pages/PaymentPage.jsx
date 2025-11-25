import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom"; // Import Link for user-friendly errors

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function PaymentPage() {
  const { user, loading, hasAccess } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // if already paid, just go to problems
  useEffect(() => {
    if (loading) return;
    if (!user) return; // let UI show "must login"
    if (hasAccess) {
      navigate("/problems", { replace: true });
    }
  }, [loading, user, hasAccess, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <p className="mb-4 text-center">
          You must be logged in to make a payment. Please log in or create an account.
        </p>
        <div className="flex gap-4">
          <Link 
            to="/login" 
            className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 transition duration-300"
          >
            Login
          </Link>
          <Link 
            to="/signup" 
            className="px-4 py-2 rounded-md bg-white text-black hover:bg-gray-200 transition duration-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  // If hasAccess is already true (just paid or paid earlier),
  // show a friendly "redirecting" state instead of the pay button.
  if (hasAccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-[#111] p-6 rounded-xl w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold mb-2">Payment Successful 🎉</h1>
          <p className="text-sm text-gray-300">
            You now have full access to the contest. Redirecting you to problems...
          </p>
        </div>
      </div>
    );
  }

  async function handlePay() {
    try {
      setError(null);
      setProcessing(true); // Set processing true at the start of the flow

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

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const options = {
        key: key_id,
        amount,
        currency,
        name: "Woxsen LeetCode Contest",
        description: "Registration Fee",
        order_id,
        prefill: {
          email: user.email || "",
        },
        theme: { color: "#673de6" },
        handler: async function (response) {
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
              throw new Error(verifyJson.error || "Payment verification failed");
            }
          } catch (err) {
            console.error("verify payment error:", err);
            setError(err.message || "Payment verification failed");
            setProcessing(false); // Only set false if flow fails
          }
        },
        modal: {
          ondismiss: () => {
            // Set processing false if modal is closed without completing payment
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("handlePay error:", err);
      setError(err.message || "Payment failed");
      setProcessing(false); // Only set false if flow fails
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="bg-[#111] p-6 rounded-xl w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold mb-2">Complete Registration</h1>
        <p className="text-sm text-gray-400">
          Pay <span className="font-semibold text-white">₹200</span> to unlock
          all contest problems and the leaderboard.
        </p>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        
        <button
          onClick={handlePay}
          disabled={processing} // Use the processing state here
          className="w-full py-2 rounded-md bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
        >
          {processing ? "Processing payment..." : "Pay ₹200 with Razorpay"}
        </button>
      </div>
    </div>
  );
}
