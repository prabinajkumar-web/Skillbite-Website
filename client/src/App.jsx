// client/src/App.jsx
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuthStore } from './store/authStore.js';
import LearnerDashboard from './pages/LearnerDashboard.jsx';
import TrainerDashboard from './pages/TrainerDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Store from './pages/Store.jsx';
import LearnerProjects from './pages/LearnerProjects.jsx';
import MyWishlist from './pages/MyWishlist.jsx';
import LearnerCustomRequests from './pages/LearnerCustomRequests.jsx';

// 🎨 Premium Home Page Component
function Home() {
  const { user } = useAuthStore();

  const categories = [
    { icon: '🍳', name: 'Cooking', color: 'bg-orange-100 text-orange-600' },
    { icon: '💄', name: 'Beauty', color: 'bg-pink-100 text-pink-600' },
    { icon: '💻', name: 'Tech & Coding', color: 'bg-blue-100 text-blue-600' },
    { icon: '📚', name: 'Academics', color: 'bg-green-100 text-green-600' },
    { icon: '🎵', name: 'Music', color: 'bg-purple-100 text-purple-600' },
    { icon: '🎨', name: 'Art & Craft', color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">SkillBite</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#categories" className="text-gray-600 hover:text-blue-600 font-medium transition">Categories</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 font-medium transition">How it Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-blue-600 font-medium transition">Reviews</a>
            </div>
            <div className="flex items-center space-x-4">
              {!user ? (
                <>
                  <Link to="/login" className="text-gray-600 font-medium hover:text-blue-600 transition">Login</Link>
                  <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-full font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition">Sign Up</Link>
                </>
              ) : (
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'trainer' ? '/trainer' : '/learner'} className="bg-green-600 text-white px-5 py-2 rounded-full font-medium shadow-md hover:bg-green-700 transition">
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 z-0"></div>
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-10 w-24 h-24 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-24 h-24 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mb-6 animate-pulse">
            ✨ The #1 Micro-Learning Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
            Learn Any Skill. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Anytime. For Any Purpose.</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Big courses are not always necessary. Sometimes, you just need one skill. Learn Saree Draping in 30 mins or clear your Maths doubts in 1 hour.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to={user ? (user.role === 'learner' ? '/learner' : '/trainer') : '/register'} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-blue-700 hover:-translate-y-1 transition transform">
              {user ? 'Find a Trainer Now' : 'Start Learning for ₹50'}
            </Link>
            <a href="#how-it-works" className="bg-white text-gray-800 border-2 border-gray-200 px-8 py-4 rounded-full font-bold text-lg shadow-sm hover:border-blue-600 hover:text-blue-600 transition">
              How it Works
            </a>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div id="categories" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Top Categories</h2>
            <p className="text-gray-500 text-lg">Find exactly what you want to learn today.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
              <div key={i} className="group cursor-pointer flex flex-col items-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 transform hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-gray-800 text-center">{cat.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How SkillBite Works</h2>
            <p className="text-gray-500 text-lg">Get started in 3 simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-blue-100 z-0"></div>
            
            {[
              { step: '1', title: 'Search Your Skill', desc: 'Find the exact skill you need. Filter by budget, mode, and duration.', icon: '🔍' },
              { step: '2', title: 'Chat & Book', desc: 'Talk to the trainer, fix the price, and book a flexible time slot.', icon: '💬' },
              { step: '3', title: 'Learn Live', desc: 'Join the video class instantly using our auto-generated meeting links.', icon: '🎥' }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition">
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg border-4 border-white">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us (Features) */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why Choose SkillBite?</h2>
              <div className="space-y-6">
                {[
                  { title: 'Pay Only for What You Need', desc: 'No need to buy expensive full courses. Just pay for the 30 minutes or 1 hour you actually need.', icon: '💰' },
                  { title: 'Flexible Sessions', desc: 'Choose from hourly, daily, weekly, or monthly packages. Learn at your own pace.', icon: '⏱️' },
                  { title: 'Quick Doubt Solving', desc: 'Stuck on a problem? Book a 15-minute instant session for just ₹50.', icon: '⚡' },
                  { title: 'Verified Trainers', desc: 'We review portfolios and certificates to ensure top quality.', icon: '🛡️' }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl transform rotate-3 scale-105 opacity-20 blur-lg"></div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Learning together" 
                className="relative rounded-3xl shadow-2xl border-4 border-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-16">Loved by Learners & Trainers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Priya S.', role: 'Learner', text: 'I needed to learn saree draping for a wedding. Found a trainer here and learned it in just 30 mins!', avatar: 'P' },
              { name: 'Rahul M.', role: 'Trainer', text: 'I teach Maths part-time. SkillBite helps me earn extra income on weekends without full-time commitment.', avatar: 'R' },
              { name: 'Anjali K.', role: 'Learner', text: 'The ₹50 Quick Doubt feature saved my exam! I got instant help with my physics numericals.', avatar: 'A' }
            ].map((review, i) => (
              <div key={i} className="bg-gray-800 p-8 rounded-2xl border border-gray-700 hover:border-blue-500 transition">
                <div className="flex text-yellow-400 mb-4 justify-center">
                  {'★★★★★'}
                </div>
                <p className="text-gray-300 italic mb-6">"{review.text}"</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                    {review.avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Are you an expert in something?</h2>
          <p className="text-blue-100 text-lg mb-10">Join as a trainer, share your skills, and start earning part-time.</p>
          <Link to="/register" className="inline-block bg-white text-blue-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:bg-gray-100 transition transform hover:scale-105">
            Become a Trainer
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <span className="text-xl font-extrabold text-gray-900">SkillBite</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 SkillBite. All rights reserved. Learn Any Skill, Anytime.</p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-blue-600">Terms</a>
            <a href="#" className="text-gray-400 hover:text-blue-600">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-blue-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/learner" element={<ProtectedRoute allowedRoles={['learner']}><LearnerDashboard /></ProtectedRoute>} />
      <Route path="/learner/bookings" element={<ProtectedRoute allowedRoles={['learner']}><MyBookings /></ProtectedRoute>} />
      <Route path="/learner/store" element={<ProtectedRoute allowedRoles={['learner']}><Store /></ProtectedRoute>} />
      <Route path="/learner/projects" element={<ProtectedRoute allowedRoles={['learner']}><LearnerProjects /></ProtectedRoute>} />
      <Route path="/learner/wishlist" element={<ProtectedRoute allowedRoles={['learner']}><MyWishlist /></ProtectedRoute>} />
      <Route path="/learner/custom-requests" element={<ProtectedRoute allowedRoles={['learner']}><LearnerCustomRequests /></ProtectedRoute>} />

      <Route path="/trainer/*" element={<ProtectedRoute allowedRoles={['trainer']}><TrainerDashboard /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}