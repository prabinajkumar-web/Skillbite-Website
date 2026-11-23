// client/src/pages/MyWishlist.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import TrainerCard from '../components/TrainerCard.jsx';

export default function MyWishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/wishlist');
        setWishlist(res.data.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchWishlist();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8 pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Wishlist ❤️</h2>
        <Link to="/learner" className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">&larr; Back</Link>
      </div>

      {loading ? <p className="text-center py-10">Loading...</p> : wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
          <p className="text-sm text-gray-400 mt-2">Explore trainers and click the 🤍 icon to save them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} onBook={() => alert('Go to Dashboard to book!')} />
          ))}
        </div>
      )}
    </div>
  );
}