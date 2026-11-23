// client/src/pages/TrainerDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import api from '../api/axios.js';

export default function TrainerDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('bookings'); 
  
  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customRequests, setCustomRequests] = useState([]); 
  const [slots, setSlots] = useState([]);
  const [profile, setProfile] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [myMaterials, setMyMaterials] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [customBadgeCount, setCustomBadgeCount] = useState(0);

  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  const [slotForm, setSlotForm] = useState({ date: '', start_time: '', end_time: '' });
  const [profileForm, setProfileForm] = useState({ 
    bio: '', hourly_rate: '', daily_rate: '', weekly_rate: '', monthly_rate: '', experience_years: '', city: '', 
    offer_text: '', discount_percentage: '' 
  });
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', price: '', file: null });
  const [uploadLoading, setUploadLoading] = useState(false);

  const [portfolioFiles, setPortfolioFiles] = useState(null);
  const [certificateFiles, setCertificateFiles] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, projectsRes, customRes, slotsRes, profileRes, skillsRes, materialsRes, earningsRes, unreadRes] = await Promise.all([
        api.get('/bookings/trainer').catch(() => ({ data: { data: [] } })),
        api.get('/projects/open').catch(() => ({ data: { data: [] } })),
        api.get('/custom-requests/open').catch(() => ({ data: { data: [] } })), 
        api.get('/trainers/availability/me').catch(() => ({ data: { data: [] } })),
        api.get('/trainers/profile/me').catch(() => ({ data: { data: null } })),
        api.get('/trainers/skills').catch(() => ({ data: { data: [] } })),
        api.get('/materials/my-uploads').catch(() => ({ data: { data: [] } })),
        api.get('/bookings/earnings').catch(() => ({ data: { data: {} } })),
        api.get('/messages/unread-count').catch(() => ({ data: { data: 0 } }))
      ]);

      setBookings(bookingsRes.data.data);
      setProjects(projectsRes.data.data);
      setCustomRequests(customRes.data.data); 
      setCustomBadgeCount(customRes.data.data.length);
      setSlots(slotsRes.data.data);
      setProfile(profileRes.data.data);
      setAllSkills(skillsRes.data.data);
      setMyMaterials(materialsRes.data.data);
      setEarnings(earningsRes.data.data);
      setUnreadCount(unreadRes.data.data);
      
      const p = profileRes.data.data;
      if (p) {
        setProfileForm({
          bio: p.bio || '', hourly_rate: p.hourly_rate || '', daily_rate: p.daily_rate || '',
          weekly_rate: p.weekly_rate || '', monthly_rate: p.monthly_rate || '',
          experience_years: p.experience_years || '', city: p.city || '',
          offer_text: p.offer_text || '', discount_percentage: p.discount_percentage || ''
        });
      }
    } catch (err) { console.error('Master Error:', err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (activeTab === 'messages') {
      const fetchConvos = async () => {
        try {
          const res = await api.get('/messages/conversations');
          setConversations(res.data.data);
        } catch (err) { console.error(err); }
      };
      fetchConvos();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!activeChat) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${activeChat.id}`);
        setMessages(res.data.data);
      } catch (err) { console.error(err); }
    };
    fetchMessages(); 
    const interval = setInterval(fetchMessages, 5000); 
    return () => clearInterval(interval);
  }, [activeChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    try {
      await api.post('/messages', { receiver_id: activeChat.id, message: newMessage });
      setNewMessage('');
    } catch (err) { console.error(err); }
  };

  const handleContactLearner = (request) => {
    setActiveChat({ id: request.learner_id, name: request.learner_name, role: 'learner' });
    setActiveTab('messages');
  };

  const handleLogout = () => { logout(); navigate('/login'); };
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'messages') setUnreadCount(0);
    if (tab === 'custom') setCustomBadgeCount(0); 
  };

  const handleAddSlot = async (e) => { e.preventDefault(); try { await api.post('/trainers/availability', slotForm); setSlotForm({ date: '', start_time: '', end_time: '' }); fetchData(); alert('Slot Added!'); } catch (err) { alert('Error adding slot'); } };
  const handleUpdateProfile = async (e) => { e.preventDefault(); try { await api.put('/trainers/profile', profileForm); fetchData(); alert('Profile & Offers Updated!'); } catch (err) { alert('Error updating profile'); } };
  const handleToggleSkill = async (skillId, isAdded) => { try { if (isAdded) await api.delete(`/trainers/skills/${skillId}`); else await api.post('/trainers/skills', { skillId }); fetchData(); } catch (err) { alert('Error updating skill'); } };
  const handleUpdateStatus = async (id, status) => { if (!window.confirm(`Mark this booking as ${status}?`)) return; try { await api.patch(`/bookings/${id}/status`, { status }); fetchData(); } catch (err) { alert('Error updating status'); } };
  const handleAcceptProject = async (id) => { if (!window.confirm('Accept this project?')) return; try { await api.patch(`/projects/${id}/accept`); fetchData(); alert('Project Accepted!'); } catch (err) { alert('Error accepting project'); } };
  const handleUploadMaterial = async (e) => { e.preventDefault(); if (!materialForm.file) return alert('Please select a PDF'); setUploadLoading(true); const formData = new FormData(); formData.append('title', materialForm.title); formData.append('description', materialForm.description); formData.append('price', materialForm.price); formData.append('pdf', materialForm.file); try { await api.post('/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); alert('PDF Uploaded!'); setMaterialForm({ title: '', description: '', price: '', file: null }); fetchData(); } catch (err) { alert('Error uploading'); } finally { setUploadLoading(false); } };

  const handlePortfolioUpload = async (e) => {
    e.preventDefault();
    if (!portfolioFiles || portfolioFiles.length === 0) return alert('Select images first');
    const formData = new FormData();
    for (let i = 0; i < portfolioFiles.length; i++) formData.append('portfolio', portfolioFiles[i]);
    try {
      await api.post('/trainers/portfolio', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Portfolio Uploaded!'); setPortfolioFiles(null); fetchData();
    } catch (err) { alert('Error uploading portfolio'); }
  };

  const handleCertificateUpload = async (e) => {
    e.preventDefault();
    if (!certificateFiles || certificateFiles.length === 0) return alert('Select certificates first');
    const formData = new FormData();
    for (let i = 0; i < certificateFiles.length; i++) formData.append('certificates', certificateFiles[i]);
    try {
      await api.post('/trainers/certificates', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Certificates Uploaded!'); setCertificateFiles(null); fetchData();
    } catch (err) { alert('Error uploading certificates'); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-600">SkillBite 👨‍🏫</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden sm:block">Trainer: {user?.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 font-medium hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {profile && profile.verification_status === 'pending' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-md">
            <p className="text-yellow-700 font-bold">⏳ Verification Pending</p>
          </div>
        )}
        
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {['bookings', 'messages', 'earnings', 'projects', 'custom', 'slots', 'profile', 'materials'].map(tab => (
            <button key={tab} onClick={() => handleTabClick(tab)} className={`relative px-6 py-3 font-medium text-sm whitespace-nowrap capitalize border-b-2 transition ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab === 'bookings' ? 'Bookings' : tab === 'messages' ? 'Messages 💬' : tab === 'earnings' ? 'My Earnings' : tab === 'projects' ? 'Projects' : tab === 'custom' ? 'Custom Requests 🎯' : tab === 'slots' ? 'Time Slots' : tab === 'profile' ? 'Profile & Rates' : 'My PDFs'}
              {tab === 'messages' && unreadCount > 0 && <span className="absolute top-2 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
              {tab === 'custom' && customBadgeCount > 0 && <span className="absolute top-2 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{customBadgeCount}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading...</div>
        ) : (
          <>
            {/* ... custom and messages tabs ... */}
            {activeTab === 'custom' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Learner Requests (Custom Skills)</h2>
                {customRequests.length === 0 ? <p className="text-gray-500 text-sm">No open requests right now.</p> : (
                  <div className="space-y-4">
                    {customRequests.map(r => (
                      <div key={r.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg bg-gray-50 gap-4">
                        <div>
                          <p className="font-bold text-gray-800">{r.skill_name} <span className="text-xs text-blue-600 font-normal">({r.mode})</span></p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{r.description}</p>
                          <p className="text-xs text-gray-500 mt-2">By {r.learner_name} | Budget: ₹{r.budget} | Duration: {r.duration}</p>
                        </div>
                        <button onClick={() => handleContactLearner(r)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 whitespace-nowrap">Contact Learner</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex h-[500px] overflow-hidden">
                <div className="w-1/3 border-r border-gray-100 overflow-y-auto bg-gray-50">
                  <h3 className="p-4 font-bold text-gray-700 border-b text-sm">Chats</h3>
                  {conversations.length === 0 && !activeChat ? <p className="p-4 text-xs text-gray-500">No messages yet.</p> : (
                    <>
                      {activeChat && !conversations.find(c => c.id === activeChat.id) && (
                        <button className="w-full text-left p-4 border-b bg-blue-50 border-l-4 border-blue-600">
                          <p className="font-bold text-sm text-gray-800">{activeChat.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{activeChat.role}</p>
                        </button>
                      )}
                      {conversations.map(c => (
                        <button key={c.id} onClick={() => setActiveChat(c)} className={`w-full text-left p-4 border-b hover:bg-blue-50 transition ${activeChat?.id === c.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                          <p className="font-bold text-sm text-gray-800">{c.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{c.role}</p>
                        </button>
                      ))}
                    </>
                  )}
                </div>
                <div className="w-2/3 flex flex-col">
                  {activeChat ? (
                    <>
                      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">{activeChat.name}</h3>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white text-sm">
                        {messages.length === 0 && <p className="text-gray-400 text-center mt-10">Start a conversation with {activeChat.name}.</p>}
                        {messages.map((msg, i) => (
                          <div key={i} className={`p-2 rounded-lg max-w-[80%] ${msg.sender_id === user.id ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-800'}`}>
                            {msg.message}
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      <form onSubmit={sendChatMessage} className="p-3 border-t bg-gray-50 flex gap-2">
                        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none" />
                        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm hover:bg-blue-700">Send</button>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400">Select a chat to start messaging</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Student Requests</h2>
                {bookings.length === 0 ? <p className="text-gray-500 text-sm">No requests yet.</p> : (
                  <div className="space-y-3">
                    {bookings.map(b => (
                      <div key={b.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg bg-gray-50 gap-4">
                        <div>
                          <p className="font-bold text-gray-800">{b.learner_name}</p>
                          <p className="text-sm text-gray-600">{b.session_date} | {b.start_time} | <span className="font-semibold text-blue-600 uppercase text-xs">{b.package_type}</span></p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded font-medium ${b.status === 'accepted' ? 'bg-green-100 text-green-700' : b.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : b.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {b.status.toUpperCase()}
                          </span>
                          {b.status === 'pending' && (
                            <>
                              <button onClick={() => handleUpdateStatus(b.id, 'accepted')} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">Accept</button>
                              <button onClick={() => handleUpdateStatus(b.id, 'rejected')} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">Reject</button>
                            </>
                          )}
                          {b.status === 'accepted' && (
                            <>
                              <a href={b.meeting_link} target="_blank" rel="noreferrer" className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700">🎥 Join Class</a>
                              <button onClick={() => handleUpdateStatus(b.id, 'completed')} className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-900">Mark Completed</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'earnings' && earnings && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200 text-center">
                  <p className="text-gray-500 font-medium">Total Earned</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">₹{earnings.total_earned || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200 text-center">
                  <p className="text-gray-500 font-medium">Pending (Accepted)</p>
                  <p className="text-4xl font-bold text-yellow-600 mt-2">₹{earnings.pending_amount || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 text-center">
                  <p className="text-gray-500 font-medium">Completed Classes</p>
                  <p className="text-4xl font-bold text-blue-600 mt-2">{earnings.completed_sessions || 0}</p>
                </div>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Open Projects</h2>
                {projects.length === 0 ? <p className="text-gray-500 text-sm">No open projects.</p> : (
                  <div className="space-y-4">
                    {projects.map(p => (
                      <div key={p.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg bg-gray-50 gap-4">
                        <div>
                          <p className="font-bold text-gray-800">{p.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{p.description}</p>
                          <p className="text-xs text-gray-500 mt-2">By {p.learner_name} | Budget: ₹{p.amount}</p>
                        </div>
                        <button onClick={() => handleAcceptProject(p.id)} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">Accept</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'slots' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Add Time Slot</h2>
                  <form onSubmit={handleAddSlot} className="space-y-4">
                    <input type="date" required value={slotForm.date} onChange={(e) => setSlotForm({...slotForm, date: e.target.value})} className="w-full border rounded-md p-2" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="time" required value={slotForm.start_time} onChange={(e) => setSlotForm({...slotForm, start_time: e.target.value})} className="w-full border rounded-md p-2" />
                      <input type="time" required value={slotForm.end_time} onChange={(e) => setSlotForm({...slotForm, end_time: e.target.value})} className="w-full border rounded-md p-2" />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-md">Add</button>
                  </form>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">My Slots</h2>
                  {slots.length === 0 ? <p className="text-gray-500 text-sm">No slots yet.</p> : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {slots.map(s => (
                        <div key={s.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50 text-sm">
                          <span>{s.date} | {s.start_time} - {s.end_time}</span>
                          <span className={`px-2 py-1 rounded text-xs ${s.is_booked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{s.is_booked ? 'Booked' : 'Available'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && profile && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Profile, Rates & Offers</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <textarea rows="2" value={profileForm.bio} onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} className="w-full border rounded-md p-2" placeholder="Bio" />
                    
                    <div className="grid grid-cols-2 gap-4 border-t pt-4">
                      <div><label className="text-xs font-bold text-gray-600">Hourly (₹)</label><input type="number" value={profileForm.hourly_rate} onChange={(e) => setProfileForm({...profileForm, hourly_rate: e.target.value})} className="w-full border rounded-md p-2 mt-1" /></div>
                      <div><label className="text-xs font-bold text-gray-600">Daily (₹)</label><input type="number" value={profileForm.daily_rate} onChange={(e) => setProfileForm({...profileForm, daily_rate: e.target.value})} className="w-full border rounded-md p-2 mt-1" /></div>
                      <div><label className="text-xs font-bold text-gray-600">Weekly (₹)</label><input type="number" value={profileForm.weekly_rate} onChange={(e) => setProfileForm({...profileForm, weekly_rate: e.target.value})} className="w-full border rounded-md p-2 mt-1" /></div>
                      <div><label className="text-xs font-bold text-gray-600">Monthly (₹)</label><input type="number" value={profileForm.monthly_rate} onChange={(e) => setProfileForm({...profileForm, monthly_rate: e.target.value})} className="w-full border rounded-md p-2 mt-1" /></div>
                    </div>

                    <div className="border-t pt-4 mt-4 bg-yellow-50 p-3 rounded">
                      <h3 className="text-sm font-bold text-yellow-800 mb-2">🔥 Run a Special Offer</h3>
                      <input type="text" value={profileForm.offer_text} onChange={(e) => setProfileForm({...profileForm, offer_text: e.target.value})} className="w-full border rounded-md p-2 mb-2" placeholder="Offer Text (e.g. 20% Off Weekend!)" />
                      <input type="number" max="100" value={profileForm.discount_percentage} onChange={(e) => setProfileForm({...profileForm, discount_percentage: e.target.value})} className="w-full border rounded-md p-2" placeholder="Discount % (e.g. 20)" />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded-md">Save Profile</button>
                  </form>

                  {/* Portfolio & Certificates Upload */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">📸 Upload Portfolio (Images)</h3>
                    {profile?.portfolio_images && (
                      <div className="flex gap-2 mb-3">
                        {profile.portfolio_images.split(',').map((img, i) => (
                          <img 
                            key={i} 
                            src={img.startsWith('http') ? img : `http://localhost:5400${img}`} 
                            className="w-16 h-16 object-cover rounded" 
                            alt="portfolio"
                          />
                        ))}
                      </div>
                    )}
                    <form onSubmit={handlePortfolioUpload} className="flex gap-2 mb-4">
                      <input type="file" accept="image/*" multiple onChange={e => setPortfolioFiles(e.target.files)} className="w-full border rounded-md p-2 text-sm" />
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm whitespace-nowrap">Upload</button>
                    </form>

                    <h3 className="text-sm font-bold text-gray-800 mb-2">🎓 Upload Certificates (PDF/Images)</h3>
                    {profile?.certificates && (
                      <div className="flex gap-2 mb-3">
                        {profile.certificates.split(',').map((cert, i) => (
                          <a 
                            key={i} 
                            href={cert.startsWith('http') ? cert : `http://localhost:5400${cert}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs bg-blue-100 px-2 py-1 rounded"
                          >
                            Cert {i+1}
                          </a>
                        ))}
                      </div>
                    )}
                    <form onSubmit={handleCertificateUpload} className="flex gap-2">
                      <input type="file" accept="image/*,.pdf" multiple onChange={e => setCertificateFiles(e.target.files)} className="w-full border rounded-md p-2 text-sm" />
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm whitespace-nowrap">Upload</button>
                    </form>
                  </div>

                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">My Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {allSkills.map(skill => {
                      const isAdded = profile.mySkills?.some(s => s.id === skill.id);
                      return (
                        <button key={skill.id} onClick={() => handleToggleSkill(skill.id, isAdded)} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${isAdded ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                          {skill.name} {isAdded ? '✓' : '+'}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Upload New PDF</h2>
                  <form onSubmit={handleUploadMaterial} className="space-y-4">
                    <input type="text" required value={materialForm.title} onChange={e => setMaterialForm({...materialForm, title: e.target.value})} className="w-full border rounded-md p-2" placeholder="Title" />
                    <textarea required value={materialForm.description} onChange={e => setMaterialForm({...materialForm, description: e.target.value})} className="w-full border rounded-md p-2" placeholder="Description" />
                    <input type="number" required value={materialForm.price} onChange={e => setMaterialForm({...materialForm, price: e.target.value})} className="w-full border rounded-md p-2" placeholder="Price (₹)" />
                    <input type="file" accept=".pdf" required onChange={e => setMaterialForm({...materialForm, file: e.target.files[0]})} className="w-full border rounded-md p-2" />
                    <button disabled={uploadLoading} className="w-full bg-blue-600 text-white py-2 rounded-md">{uploadLoading ? 'Uploading...' : 'Upload PDF'}</button>
                  </form>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">My PDFs</h2>
                  {myMaterials.length === 0 ? <p className="text-gray-500 text-sm">No PDFs uploaded.</p> : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {myMaterials.map(m => (
                        <div key={m.id} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50">
                          <div>
                            <p className="font-medium text-gray-800">{m.title}</p>
                            <p className="text-sm text-gray-600">₹{m.price} | {m.total_sales} sales</p>
                          </div>
                          <a href={m.pdf_url.startsWith('http') ? m.pdf_url : `http://localhost:5400${m.pdf_url}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View</a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}