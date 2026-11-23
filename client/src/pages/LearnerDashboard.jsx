// client/src/pages/LearnerDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import api from '../api/axios.js';
import TrainerCard from '../components/TrainerCard.jsx';

export default function LearnerDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const [trainers, setTrainers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [modeFilter, setModeFilter] = useState('');

  // Booking Modal State
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // Chat & Package
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [packageType, setPackageType] = useState('hourly');
  const chatEndRef = useRef(null);

  // Quick Doubt
  const [quickDoubtOpen, setQuickDoubtOpen] = useState(false);
  const [quickTrainerId, setQuickTrainerId] = useState('');
  const [quickDoubtLoading, setQuickDoubtLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [trainersRes, catRes, upRes] = await Promise.all([
          api.get('/trainers').catch(() => ({ data: { data: [] } })),
          api.get('/categories').catch(() => ({ data: { data: [] } })),
          api.get('/bookings/upcoming').catch(() => ({ data: { data: [] } }))
        ]);
        setTrainers(trainersRes.data.data);
        setCategories(catRes.data.data);
        setUpcoming(upRes.data.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  // SMART MATCHING FILTER LOGIC
  const filteredTrainers = trainers.filter(t => {
    const query = search.toLowerCase();
    const nameMatch = t.name ? t.name.toLowerCase().includes(query) : false;
    const skillMatch = t.skills ? t.skills.toLowerCase().includes(query) : false;
    const cityMatch = t.city ? t.city.toLowerCase().includes(query) : false;
    const searchPass = nameMatch || skillMatch || cityMatch;

    const categoryPass = selectedCategory === '' || (t.skills && t.skills.toLowerCase().includes(categories.find(c => c.id.toString() === selectedCategory)?.name.toLowerCase() || ''));
    
    // Budget Match
    const budgetPass = maxBudget === '' || (t.hourly_rate <= Number(maxBudget));

    // Mode Match
    const modePass = modeFilter === '' || (t.mode && t.mode.toLowerCase().includes(modeFilter.toLowerCase()));

    return searchPass && categoryPass && budgetPass && modePass;
  });

  // Chat Polling
  useEffect(() => {
    if (!selectedTrainer) return;
    const fetchChat = async () => {
      try {
        const res = await api.get(`/messages/${selectedTrainer.user_id}`);
        setChatMessages(res.data.data);
      } catch (err) { console.error(err); }
    };
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [selectedTrainer]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const handleBookClick = async (trainer) => {
    setSelectedTrainer(trainer);
    setSlotLoading(true);
    setPackageType('hourly');
    setSlots([]);
    setChatMessages([]);
    try {
      const [slotsRes, chatRes] = await Promise.all([
        api.get(`/trainers/${trainer.id}/availability`),
        api.get(`/messages/${trainer.user_id}`)
      ]);
      setSlots(slotsRes.data.data);
      setChatMessages(chatRes.data.data);
    } catch (err) { alert('Failed to load details'); } finally { setSlotLoading(false); }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const msgToSend = newMessage;
      setNewMessage('');
      setChatMessages(prev => [...prev, { sender_id: user.id, message: msgToSend }]);
      await api.post('/messages', { receiver_id: selectedTrainer.user_id, message: msgToSend });
    } catch (err) { console.error('Chat Error:', err); }
  };

  const getPackageAmount = () => {
    if (!selectedTrainer) return 0;
    let baseAmount = 0;
    if (packageType === 'hourly') baseAmount = selectedTrainer.hourly_rate || 0;
    if (packageType === 'daily') baseAmount = selectedTrainer.daily_rate || 0;
    if (packageType === 'weekly') baseAmount = selectedTrainer.weekly_rate || 0;
    if (packageType === 'monthly') baseAmount = selectedTrainer.monthly_rate || 0;
    if (selectedTrainer.discount_percentage > 0) baseAmount = baseAmount - (baseAmount * selectedTrainer.discount_percentage / 100);
    return Math.round(baseAmount);
  };

  const handleBookSlot = async (slotId) => {
    const amount = getPackageAmount();
    if (amount <= 0) return alert('Trainer has not set the rate for this package.');
    setBookingLoading(true);
    try {
      await api.post('/bookings', { trainer_id: selectedTrainer.id, availability_id: slotId, package_type: packageType, amount: amount });
      alert('Booking Requested! 🎉');
      setSelectedTrainer(null);
    } catch (err) { alert(err.response?.data?.message || 'Booking failed'); } finally { setBookingLoading(false); }
  };

  const handleQuickDoubt = async (e) => {
    e.preventDefault();
    if (!quickTrainerId) return alert('Please select a trainer.');
    setQuickDoubtLoading(true);
    try {
      await api.post('/bookings', { trainer_id: quickTrainerId, package_type: 'quick_doubt', amount: 50 });
      alert('Quick Doubt Booked! 🎉');
      setQuickDoubtOpen(false);
      setQuickTrainerId('');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); } finally { setQuickDoubtLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 relative">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-blue-600">JustLearn 🎓</h1>
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto">
          <Link to="/learner/wishlist" className="text-sm bg-red-50 text-red-600 px-3 py-1.5 rounded-md font-medium hover:bg-red-100 transition whitespace-nowrap">Wishlist ❤️</Link>
          <Link to="/learner/custom-requests" className="text-sm bg-green-50 text-green-600 px-3 py-1.5 rounded-md font-medium hover:bg-green-100 transition whitespace-nowrap">Custom Request</Link>
          <Link to="/learner/projects" className="text-sm bg-purple-50 text-purple-600 px-3 py-1.5 rounded-md font-medium hover:bg-purple-100 transition whitespace-nowrap">Projects</Link>
          <Link to="/learner/store" className="text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md font-medium hover:bg-blue-100 transition whitespace-nowrap">Store</Link>
          <Link to="/learner/bookings" className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md font-medium hover:bg-gray-200 transition whitespace-nowrap">My Bookings</Link>
          <span className="text-sm text-gray-600 hidden sm:block whitespace-nowrap">Hi, {user?.name}</span>
          <button onClick={handleLogout} className="text-sm text-red-500 font-medium hover:underline whitespace-nowrap">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* QUICK DOUBT BANNER */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-xl p-6 text-white mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg gap-4">
          <div>
            <h2 className="text-2xl font-bold">Have a quick doubt? ⚡</h2>
            <p className="text-orange-100 mt-1">Talk to a trainer right now for just ₹50 (15 mins).</p>
          </div>
          <button onClick={() => setQuickDoubtOpen(true)} className="bg-white text-red-500 px-8 py-3 rounded-full font-bold shadow hover:bg-gray-100 transition whitespace-nowrap">Ask Now</button>
        </div>

        {/* UPCOMING CLASSES */}
        {upcoming.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3">📅 Upcoming Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map(u => (
                <div key={u.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl shadow-sm">
                  <p className="text-sm text-gray-600">With <span className="font-bold text-gray-800">{u.trainer_name}</span></p>
                  <p className="text-lg font-bold text-blue-600 mt-1">{u.session_date} | {u.start_time}</p>
                  <a href={u.meeting_link} target="_blank" rel="noreferrer" className="mt-3 block text-center bg-blue-600 text-white text-sm py-1.5 rounded-lg hover:bg-blue-700">🎥 Join Class</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SMART MATCHING FILTERS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Find your perfect trainer</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="Search skill or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option value="">Any Mode</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>

            <select value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option value="">Any Budget</option>
              <option value="500">Under ₹500</option>
              <option value="1000">Under ₹1000</option>
              <option value="2000">Under ₹2000</option>
            </select>
          </div>
        </div>

        {/* TRAINERS GRID */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">Loading trainers...</div>
        ) : filteredTrainers.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm">No trainers matched your criteria. Try changing filters.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} onBook={() => handleBookClick(trainer)} />
            ))}
          </div>
        )}
      </div>

      {/* QUICK DOUBT MODAL */}
      {quickDoubtOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">⚡ Quick Doubt</h3>
              <button onClick={() => setQuickDoubtOpen(false)} className="text-gray-500 hover:text-red-500 text-2xl font-bold leading-none">&times;</button>
            </div>
            <form onSubmit={handleQuickDoubt} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Trainer</label>
                <select required value={quickTrainerId} onChange={(e) => setQuickTrainerId(e.target.value)} className="w-full border rounded-md p-2 bg-white">
                  <option value="">-- Choose a Trainer --</option>
                  {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.skills || 'Expert'})</option>)}
                </select>
              </div>
              <div className="bg-orange-50 p-3 rounded border border-orange-100 text-sm text-orange-800">
                <p className="font-bold">Amount to pay: ₹50</p>
                <p className="text-xs mt-1">Duration: 15 Minutes. Instant video link.</p>
              </div>
              <button type="submit" disabled={quickDoubtLoading} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-md font-bold hover:from-orange-600 hover:to-red-600 disabled:opacity-50">
                {quickDoubtLoading ? 'Booking...' : 'Pay ₹50 & Start'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {selectedTrainer && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">Book with {selectedTrainer.name}</h3>
              <button onClick={() => setSelectedTrainer(null)} className="text-gray-500 hover:text-red-500 text-2xl font-bold leading-none">&times;</button>
            </div>
            <div className="overflow-y-auto p-4 space-y-6">
              
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="p-2 bg-gray-100 border-b text-xs font-bold text-gray-600 rounded-t-lg flex justify-between">
                  <span>💬 Discuss your needs</span>
                  <span className="text-[10px] text-green-600 font-normal">● Live</span>
                </div>
                <div className="h-40 overflow-y-auto p-3 space-y-2 text-sm">
                  {chatMessages.length === 0 ? <p className="text-gray-400 text-center text-xs mt-10">Start a conversation.</p> : chatMessages.map((msg, i) => (
                    <div key={i} className={`p-2 rounded-lg max-w-[85%] ${msg.sender_id === user.id ? 'bg-blue-600 text-white ml-auto' : 'bg-white border text-gray-800'}`}>{msg.message}</div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendChatMessage} className="flex p-2 gap-2 border-t bg-white">
                  <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type message..." className="flex-1 border rounded-full px-3 py-1 text-sm focus:outline-none" />
                  <button type="submit" className="bg-gray-800 text-white px-4 py-1 rounded-full text-sm">Send</button>
                </form>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-700 mb-2">Select Package</h4>
                <select value={packageType} onChange={(e) => setPackageType(e.target.value)} className="w-full border rounded-md p-2 bg-white mb-4">
                  <option value="hourly" disabled={selectedTrainer.hourly_rate <= 0}>Hourly - ₹{selectedTrainer.hourly_rate || 0}</option>
                  <option value="daily" disabled={selectedTrainer.daily_rate <= 0}>Daily - ₹{selectedTrainer.daily_rate || 0}</option>
                  <option value="weekly" disabled={selectedTrainer.weekly_rate <= 0}>Weekly - ₹{selectedTrainer.weekly_rate || 0}</option>
                  <option value="monthly" disabled={selectedTrainer.monthly_rate <= 0}>Monthly - ₹{selectedTrainer.monthly_rate || 0}</option>
                </select>

                <h4 className="font-bold text-sm text-gray-700 mb-2">Select Start Time</h4>
                {slotLoading ? <p className="text-sm text-gray-500">Loading slots...</p> : slots.length === 0 ? <p className="text-sm text-red-500 bg-red-50 p-2 rounded">No available slots.</p> : (
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {slots.map((slot) => (
                      <button key={slot.id} onClick={() => handleBookSlot(slot.id)} disabled={bookingLoading} className="p-2 border rounded-md text-left text-sm hover:bg-blue-50 transition">
                        <p className="font-bold text-gray-800">{slot.date}</p>
                        <p className="text-xs text-gray-600">{slot.start_time} - {slot.end_time}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 text-right rounded-b-xl">
              <p className="text-xs text-gray-500 mb-1">Selected: <span className="font-bold text-gray-700 capitalize">{packageType}</span></p>
              <p className="text-xl font-bold text-blue-600">Total: ₹{getPackageAmount()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}