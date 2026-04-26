import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [hasReviewed, setHasReviewed] = useState(false);

  const [toast, setToast] = useState({ open: false, type: 'info', message: '' });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false, type: 'info', message: '' }), 5000);
  };

  useEffect(() => {
    load();
  }, [id, user]);

  async function load() {
    try {
      const [e, r] = await Promise.all([
        axios.get(`/api/events/${id}`),
        axios.get(`/api/reviews/${id}`),
      ]);

      console.log("EVENT RESPONSE:", e.data); // 🔍 DEBUG

      // ✅ Safe event handling
      if (e.data?.event) {
        setEvent(e.data?.event || e.data);
      } else {
        setEvent(e.data);
      }

      setReviews(r.data.reviews || []);

      if (user) {
        const userReview = r.data.reviews?.find(
          (review) => review.user?._id === user.id
        );
        setHasReviewed(!!userReview);
      }
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load event');
    }
  }

  async function register() {
    try {
      await axios.post(`/api/registrations/${id}/register`);
      showToast('success', 'Registered! Check your email for confirmation.');
    } catch (err) {
      showToast('error', 'Registration failed');
    }
  }

  const formatKES = (amount) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount || 0);

  // ✅ Buy Ticket → redirect with event data
    async function buyTicket(event) {
    console.log(event);
    if (!user) {
      showToast('warning', 'Please login first');
      return;
    }

    if (!event) return;

    
    const res = await axios.post('/api/mpesa/payments/buy', { event:event});
  }

  function shareEvent() {
    const url = window.location.href;
    if (navigator.share) {
      navigator
        .share({ title: event.title, text: event.description, url })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert('Event link copied!');
    }
  }

  function downloadIcs() {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CampusEvents//EN
BEGIN:VEVENT
UID:${event._id}@campus
DTSTAMP:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}.ics`;
    a.click();

    URL.revokeObjectURL(url);
  }

  async function submitReview() {
    try {
      await axios.post(`/api/reviews/${id}`, { rating, comment });
      showToast('success', 'Review posted successfully!');
      setComment('');
      await load();
    } catch (error) {
      showToast('error', 'Failed to post review');
    }
  }

  // ✅ Stronger loading check
  if (!event || !event.title) {
    return <div className="p-4">Loading event...</div>;
  }

  return (
    <div className="space-y-4">
      {toast.open && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white bg-blue-600">
          {toast.message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <img
          src={event.posterUrl || '/placeholder.svg'}
          className="w-full h-64 object-cover rounded-xl"
        />

        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <p className="text-slate-700 mt-2 dark:text-slate-300">
            {event.description}
          </p>

          <div className="text-sm text-slate-500 mt-2 dark:text-slate-400">
            {new Date(event.date).toLocaleString()} • {event.location}
          </div>

          <div className="flex gap-2 mt-3">
            <button className="btn" onClick={register} disabled={!user}>
              Register
            </button>

            {/* ✅ Buy Ticket → goes to checkout */}
            <button className="btn" onClick={() => buyTicket(event)} disabled={!user}>
              Buy Ticket{' '}
              {event.price ? `(${formatKES(event.price)})` : '(Free)'}
            </button>

            <button className="btn-outline" onClick={shareEvent}>
              Share
            </button>


            <button className="btn-outline" onClick={downloadIcs}>
              Add to Calendar
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Reviews</h2>
        <ul className="space-y-2">
          {reviews.map((r) => (
            <li key={r._id} className="p-3 border rounded-xl">
              <div>{r.user?.name}</div>
              <div>⭐ {r.rating}</div>
              <p>{r.comment}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}