// client/src/pages/LearnerProjects.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';

export default function LearnerProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', project_type: 'Science', deadline: '', amount: '' });

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/my-requests');
      setProjects(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', form);
      alert('Project Requested Successfully! 🎉');
      setForm({ title: '', description: '', project_type: 'Science', deadline: '', amount: '' });
      fetchProjects();
    } catch (err) { alert('Error requesting project'); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mt-8 pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Project Help 🛠️</h2>
        <Link to="/learner" className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back to Home</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Request Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Post a New Project</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full border rounded-md p-2" placeholder="Project Title (e.g. IoT Home Automation)" />
            <textarea required rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-md p-2" placeholder="Describe your requirements..." />
            <div className="grid grid-cols-2 gap-4">
              <select value={form.project_type} onChange={e => setForm({...form, project_type: e.target.value})} className="w-full border rounded-md p-2">
                <option value="Science">Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Coding">Coding</option>
                <option value="Other">Other</option>
              </select>
              <input type="date" required value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full border rounded-md p-2" />
            </div>
            <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full border rounded-md p-2" placeholder="Budget (Optional)" />
            <button className="w-full bg-blue-600 text-white py-2 rounded-md">Post Request</button>
          </form>
        </div>

        {/* My Projects List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">My Projects</h3>
          {loading ? <p className="text-gray-500 text-sm">Loading...</p> : projects.length === 0 ? <p className="text-gray-500 text-sm">No projects requested yet.</p> : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {projects.map(p => (
                <div key={p.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-800">{p.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${p.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {p.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{p.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Trainer: {p.trainer_name || 'Waiting for acceptance...'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}