// client/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import api from '../api/axios.js';

export default function AdminDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pendingTrainers, setPendingTrainers] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [newSkill, setNewSkill] = useState({ category_id: '', name: '', description: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, bookingsRes, pendingRes, catRes] = await Promise.all([
        api.get('/admin/stats').catch(() => ({ data: { data: {} } })),
        api.get('/admin/users').catch(() => ({ data: { data: [] } })),
        api.get('/admin/bookings').catch(() => ({ data: { data: [] } })),
        api.get('/admin/pending-trainers').catch(() => ({ data: { data: [] } })),
        api.get('/categories').catch(() => ({ data: { data: [] } }))
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setBookings(bookingsRes.data.data);
      setPendingTrainers(pendingRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure? This will delete the user and all their data permanently.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
      alert('User deleted');
    } catch (err) { alert('Error deleting user'); }
  };

  const handleVerify = async (id, status) => {
    try {
      await api.patch(`/admin/verify-trainer/${id}`, { status });
      fetchData();
    } catch (err) { alert('Error verifying trainer'); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', newCategory);
      setNewCategory({ name: '', icon: '' });
      fetchData();
      alert('Category Added!');
    } catch (err) { alert('Error adding category'); }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/skills', newSkill);
      setNewSkill({ category_id: '', name: '', description: '' });
      alert('Skill Added Successfully!');
    } catch (err) { alert('Error adding skill'); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-gray-900 text-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold">SkillBite 🛡️ Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300 hidden sm:block">Admin: {user?.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-400 font-medium hover:text-red-300">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {['overview', 'users', 'categories', 'bookings', 'verifications'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 font-medium text-sm whitespace-nowrap capitalize border-b-2 transition ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'overview' ? 'Platform Overview' : tab === 'users' ? 'Manage Users' : tab === 'categories' ? 'Categories & Skills' : tab === 'bookings' ? 'All Bookings' : 'Trainer Verifications'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading Dashboard...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">Total Users (Learners+Trainers)</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.users || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">Total Trainers</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.trainers || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.bookings || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">Total Revenue (Mock)</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">₹{stats.revenue || 0}</p>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50"><h2 className="font-bold text-gray-800">All Users</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
                      <tr>
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Email</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">City</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                          <td className="px-6 py-4">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'trainer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{u.role.toUpperCase()}</span>
                          </td>
                          <td className="px-6 py-4">{u.city || '-'}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 font-medium text-xs bg-red-50 px-3 py-1 rounded">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CATEGORIES & SKILLS TAB */}
            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Category</h2>
                  <form onSubmit={handleAddCategory} className="space-y-4 mb-6">
                    <input type="text" required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full border rounded-md p-2" placeholder="Category Name (e.g. Music)" />
                    <input type="text" value={newCategory.icon} onChange={e => setNewCategory({...newCategory, icon: e.target.value})} className="w-full border rounded-md p-2" placeholder="Emoji Icon (e.g. 🎵)" />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md w-full">Add Category</button>
                  </form>

                  <h3 className="font-bold text-gray-700 mb-2 border-t pt-4">Existing Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(c => (
                      <span key={c.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{c.icon} {c.name}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Skill</h2>
                  <form onSubmit={handleAddSkill} className="space-y-4">
                    <select required value={newSkill.category_id} onChange={e => setNewSkill({...newSkill, category_id: e.target.value})} className="w-full border rounded-md p-2 bg-white">
                      <option value="">-- Select Category --</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="text" required value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} className="w-full border rounded-md p-2" placeholder="Skill Name (e.g. Piano Basics)" />
                    <textarea value={newSkill.description} onChange={e => setNewSkill({...newSkill, description: e.target.value})} className="w-full border rounded-md p-2" placeholder="Short Description" />
                    <button className="bg-green-600 text-white px-4 py-2 rounded-md w-full">Add Skill</button>
                  </form>
                </div>
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b bg-gray-50"><h2 className="font-bold text-gray-800">All Platform Bookings</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-500">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Learner</th>
                        <th className="px-6 py-3">Trainer</th>
                        <th className="px-6 py-3">Date & Time</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">#{b.id}</td>
                          <td className="px-6 py-4 font-medium text-gray-800">{b.learner_name}</td>
                          <td className="px-6 py-4">{b.trainer_name}</td>
                          <td className="px-6 py-4">{b.session_date} | {b.start_time}</td>
                          <td className="px-6 py-4 font-bold text-green-600">₹{b.amount}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${b.status === 'accepted' ? 'bg-green-100 text-green-700' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : b.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{b.status.toUpperCase()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* VERIFICATIONS TAB */}
            {activeTab === 'verifications' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Pending Trainer Verifications</h2>
                {pendingTrainers.length === 0 ? <p className="text-gray-500 text-sm">No pending verifications.</p> : (
                  <div className="space-y-4">
                    {pendingTrainers.map(t => (
                      <div key={t.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg bg-gray-50 gap-4">
                        <div>
                          <p className="font-bold text-gray-800">{t.name}</p>
                          <p className="text-sm text-gray-600">{t.email} | {t.city || 'No city'}</p>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{t.bio || 'No bio provided'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleVerify(t.id, 'approved')} className="text-sm bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700">Approve</button>
                          <button onClick={() => handleVerify(t.id, 'rejected')} className="text-sm bg-red-600 text-white px-4 py-1.5 rounded hover:bg-red-700">Reject</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}