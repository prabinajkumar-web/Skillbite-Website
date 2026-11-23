// client/src/pages/LearnerCustomRequests.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function LearnerCustomRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ skill_name: '', description: '', budget: '', duration: '', mode: 'online' });

  const fetchRequests = async () => {
    try {
      const res = await api.get('/custom-requests/my-requests');
      setRequests(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/custom-requests', form);
      alert('Request Posted Successfully! 🎉 Trainers will contact you soon.');
      setForm({ skill_name: '', description: '', budget: '', duration: '', mode: 'online' });
      fetchRequests();
    } catch (err) { alert('Error posting request'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mt-8 pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quick Skill Request 📝</h2>
        <Link to="/learner" className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">&larr; Back</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Request a Skill</h3>
          <p className="text-sm text-gray-500 mb-4">Can't find what you need? Ask for it and let trainers come to you.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" required value={form.skill_name} onChange={e => setForm({...form, skill_name: e.target.value})} className="w-full border rounded-md p-2" placeholder="What do you want to learn? (e.g. Advanced Baking)" />
            <textarea rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-md p-2" placeholder="Specific requirements..." />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="w-full border rounded-md p-2" placeholder="Max Budget (₹)" />
              <input type="text" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full border rounded-md p-2" placeholder="Duration (e.g. 2 hours)" />
            </div>
            <select value={form.mode} onChange={e => setForm({...form, mode: e.target.value})} className="w-full border rounded-md p-2 bg-white">
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="both">Both</option>
            </select>
            <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Post Request</button>
          </form>
        </div>

        {/* My Requests */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">My Requests</h3>
          {loading ? <p>Loading...</p> : requests.length === 0 ? <p className="text-gray-500 text-sm">No requests posted yet.</p> : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {requests.map(r => (
                <div key={r.id} className="p-3 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-gray-800">{r.skill_name}</p>
                    <span className={`text-xs px-2 py-1 rounded ${r.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{r.status.toUpperCase()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{r.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Budget: ₹{r.budget} | Duration: {r.duration} | Mode: {r.mode}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}