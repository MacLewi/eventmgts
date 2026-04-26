import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function CheckoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // ✅ Use event passed from EventDetails if available
  const [event, setEvent] = useState(location.state?.event || null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 3000);
  };

  useEffect(() => {
    if (!event) {
      loadEvent();
    }
  }, [id, event]);

  async function loadEvent() {
    try {
      const res = await axios.get(`/api/events/${id}`);

      console.log("EVENT RESPONSE:", res.data); // 🔍 DEBUG

      // ✅ Ensure correct structure
      if (res.data?.event) {
        setEvent(res.data.event);
      } else {
        setEvent(res.data); // fallback if backend returns event directly
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load event');
    }
  }

  const formatKES = (amount) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount || 0);

  const price = event?.price || 0;
  const total = price * quantity;

  async function handlePayment() {
    if (!user) return showToast('error', 'Please login first');
    if (!event) return;

    setLoading(true);

    try {
      const response = await axios.post(`/api/mpesa/payments/${id}/buy`, {
        amount: total,
      });

      showToast(
        'success',
        `STK Push sent! Check your phone. Transaction ID: ${
          response.data?.transactionId || 'N/A'
        }`
      );

      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      showToast(
        'error',
        err.response?.data?.message || 'Payment failed'
      );
    } finally {
      setLoading(false);
    }
  }

  // ✅ Stronger safe render
if (!event) {
  return <div>Loading checkout...</div>;
}

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {toast.open && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded text-white shadow-lg z-50
          ${
            toast.type === 'success'
              ? 'bg-green-600'
              : toast.type === 'error'
              ? 'bg-red-600'
              : 'bg-blue-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="border rounded-xl p-4 bg-white shadow">
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="text-gray-500">{event.location}</p>
        <p className="text-sm mt-1">
          Date: {new Date(event.date).toLocaleString()}
        </p>
      </div>

      <div className="border rounded-xl p-4 bg-white shadow space-y-4">
        <div className="flex justify-between">
          <span>Price per ticket</span>
          <span className="font-semibold">{formatKES(price)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span>Quantity</span>
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1 border rounded"
              onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>
        </div>

        <hr />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>{formatKES(total)}</span>
        </div>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
      >
        {loading ? 'Processing...' : `Pay ${formatKES(total)} via M-Pesa`}
      </button>
    </div>
  );
}