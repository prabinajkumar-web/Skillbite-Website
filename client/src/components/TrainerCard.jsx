// client/src/components/TrainerCard.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios.js';

export default function TrainerCard({ trainer, onBook }) {
  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    api.get(`/wishlist/check/${trainer.id}`).then(res => setIsWished(res.data.data.isWished)).catch(() => {});
  }, [trainer.id]);

  const toggleWishlist = async () => {
    try {
      if (isWished) {
        await api.delete(`/wishlist/${trainer.id}`);
        setIsWished(false);
      } else {
        await api.post('/wishlist', { trainer_id: trainer.id });
        setIsWished(true);
      }
    } catch (err) { alert('Please login as a learner'); }
  };

  const hasOffer = trainer.discount_percentage > 0;
  const discountedPrice = hasOffer ? (trainer.hourly_rate * (100 - trainer.discount_percentage) / 100).toFixed(0) : trainer.hourly_rate;
  
  const portfolio = trainer.portfolio_images ? trainer.portfolio_images.split(',') : [];
  const certificates = trainer.certificates ? trainer.certificates.split(',') : [];

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition relative overflow-hidden flex flex-col h-full">
      
      {hasOffer && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
          {trainer.discount_percentage}% OFF
        </div>
      )}

      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold uppercase shrink-0">
          {trainer.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-800 truncate">{trainer.name}</h3>
          <p className="text-xs text-gray-500">{trainer.city || 'Location not set'}</p>
        </div>
        <button onClick={toggleWishlist} className="text-2xl focus:outline-none shrink-0">
          {isWished ? '❤️' : '🤍'}
        </button>
      </div>
      
      <div className="flex items-center gap-1 mb-2">
        <span className="text-yellow-400">★</span>
        <span className="text-sm font-medium text-gray-700">{Number(trainer.avg_rating || 0).toFixed(1)}</span>
        <span className="text-xs text-gray-500">({trainer.total_sessions || 0} sessions)</span>
      </div>

      {/* Portfolio Images */}
      {portfolio.length > 0 && (
        <div className="flex gap-2 overflow-x-auto mb-3 py-1">
          {portfolio.map((img, i) => (
            <a key={i} href={img.startsWith('http') ? img : `http://localhost:5400${img}`} target="_blank" rel="noreferrer">
              <img 
                src={img.startsWith('http') ? img : `http://localhost:5400${img}`} 
                alt="Portfolio" 
                className="w-16 h-16 object-cover rounded-md border border-gray-200 shrink-0 hover:opacity-80 transition" 
              />
            </a>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
        {trainer.bio || 'No bio added yet.'}
      </p>

      {hasOffer && trainer.offer_text && (
        <div className="bg-red-50 text-red-600 text-xs font-medium px-2 py-1 rounded mb-3 inline-block w-fit">
          🔥 {trainer.offer_text}
        </div>
      )}
      
      <div className="flex flex-wrap gap-1 mb-4">
        {trainer.skills ? trainer.skills.split(',').slice(0, 3).map((skill, i) => (
          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{skill.trim()}</span>
        )) : <span className="text-xs text-gray-400">No skills listed</span>}
        {trainer.skills && trainer.skills.split(',').length > 3 && <span className="text-xs text-gray-500 px-1 py-1">+{trainer.skills.split(',').length - 3} more</span>}
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-bold text-gray-600 mb-1">🎓 Verified Certificates:</p>
          <div className="flex gap-2">
            {certificates.map((cert, i) => (
              <a 
                key={i} 
                href={cert.startsWith('http') ? cert : `http://localhost:5400${cert}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100"
              >
                View Cert {i + 1}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center border-t pt-3 mt-auto">
        <div>
          {hasOffer ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 line-through">₹{trainer.hourly_rate}</span>
              <span className="font-bold text-green-600">₹{discountedPrice} <span className="text-xs text-gray-500 font-normal">/ hr</span></span>
            </div>
          ) : (
            <div><span className="font-semibold text-blue-600">₹{trainer.hourly_rate}</span><span className="text-xs text-gray-500"> / hr</span></div>
          )}
        </div>
        <button onClick={onBook} className="text-sm bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-100 font-medium transition">Book Now</button>
      </div>
    </div>
  );
}