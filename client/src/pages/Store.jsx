// client/src/pages/Store.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function Store() {
  const [materials, setMaterials] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [activeTab, setActiveTab] = useState('store');

  const fetchData = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        api.get('/materials'),
        api.get('/materials/my-purchases')
      ]);
      setMaterials(mRes.data.data);
      setPurchases(pRes.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBuy = async (id) => {
    if (!window.confirm('Confirm purchase?')) return;
    try {
      await api.post(`/materials/${id}/buy`);
      alert('Purchased Successfully! 🎉');
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Purchase failed'); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8 pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Materials Store 📚</h2>
        <Link to="/learner" className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Home</Link>
      </div>

      <div className="flex gap-4 mb-6 border-b">
        <button onClick={() => setActiveTab('store')} className={`pb-2 px-4 font-medium ${activeTab === 'store' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>All Materials</button>
        <button onClick={() => setActiveTab('purchases')} className={`pb-2 px-4 font-medium ${activeTab === 'purchases' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>My Purchases</button>
      </div>

      {activeTab === 'store' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.length === 0 ? <p className="text-gray-500">No materials available yet.</p> : materials.map(m => (
            <div key={m.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-800 mb-1">{m.title}</h3>
                <p className="text-sm text-gray-500 mb-2">By {m.trainer_name}</p>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{m.description}</p>
              </div>
              <div className="flex justify-between items-center mt-4 border-t pt-3">
                <span className="font-bold text-blue-600">₹{m.price}</span>
                <button onClick={() => handleBuy(m.id)} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700">Buy Now</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'purchases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.length === 0 ? <p className="text-gray-500">No purchases yet.</p> : purchases.map(m => (
            <div key={m.id} className="bg-white p-5 rounded-xl shadow-sm border border-green-200">
              <h3 className="font-bold text-lg text-gray-800 mb-1">{m.title}</h3>
              <p className="text-sm text-gray-500 mb-4">By {m.trainer_name}</p>
              <a href={`http://localhost:5400${m.pdf_url}`} target="_blank" rel="noreferrer" className="block text-center w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Download PDF</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}