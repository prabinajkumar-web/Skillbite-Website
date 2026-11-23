// client/src/pages/MyBookings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings');
        setBookings(res.data.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchBookings();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 mt-8 pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Bookings 🗓️</h2>
        <Link to="/learner" className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">&larr; Back</Link>
      </div>

      {loading ? <p className="text-center py-10">Loading...</p> : bookings.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm"><p className="text-gray-500">No bookings yet.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800">{booking.trainer_name}</h3>
                <span className={`text-xs px-2 py-1 rounded font-medium ${booking.status === 'accepted' ? 'bg-green-100 text-green-700' : booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                  {booking.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-700">Date:</span> {booking.session_date}</p>
              <p className="text-sm text-gray-600 mb-1"><span className="font-medium text-gray-700">Time:</span> {booking.start_time}</p>
              <p className="text-sm text-gray-600 mb-3"><span className="font-medium text-gray-700">Package:</span> <span className="uppercase">{booking.package_type}</span> (₹{booking.amount})</p>
              
              {booking.status === 'accepted' && booking.meeting_link && (
                <a href={booking.meeting_link} target="_blank" rel="noreferrer" className="block text-center w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-medium">
                  🎥 Join Video Class
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}