import React, { useState, useEffect, useRef } from "react";
import { auth } from "../services/firebase"; 
import { Link, useLocation } from "react-router-dom"; 

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // We no longer need the 'isScrolled' state because the navbar 
  // will maintain a consistent, high-visibility frosted background at all times.
  
  const location = useLocation();
  const profileRef = useRef(null);

  // 1. Auth Listener (Gets actual user data for avatar/name)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe; 
  }, []);

  // 2. Click Outside Listener (Closes profile dropdown cleanly)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout Logic
  async function handleLogout() {
    try {
      await auth.signOut();
      localStorage.removeItem("sessionKey"); 
      window.location.href = "/"; 
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  // Helper to highlight the active page
  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16"> {/* Fixed height for consistency */}
          
          {/* --- LEFT: BRAND LOGO --- */}
          <Link to="/" className="flex items-center gap-3 group">
              {/* Bold, high-contrast Logo Icon */}
              <div className="relative w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105">
                <span className="text-white font-black text-xl italic pr-1">E</span>
                <span className="absolute top-1 right-1 text-indigo-400 font-bold text-[10px]">2</span>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></div>
              </div>
              
              {/* Stacked Typography */}
              <div className="flex flex-col justify-center text-left">
                <h1 className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">
                  Exam<span className="text-indigo-600">Ease</span>
                </h1>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 leading-none">
                  Proctoring
                </span>
              </div>
          </Link>

          {/* --- CENTER: MAIN NAVIGATION (Desktop) --- */}
          {user && (
            <div className="hidden md:flex items-center space-x-2">
              <Link 
                to="/aboutUs" 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive('/aboutUs') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                About
              </Link>
              <Link 
                to="/exams" 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive('/exams') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                Exams {/* Reverted back from "Directory" to "Exams" */}
              </Link>
              <Link 
                to="/dashboard" 
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                Dashboard
              </Link>
            </div>
          )}

          {/* --- RIGHT: ACTIONS & PROFILE --- */}
          <div className="hidden md:flex items-center gap-5">
            {user ? (
              <>
                {/* Primary CTA */}
                <Link 
                  to="/create-exam"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Create Exam
                </Link>

                <div className="h-8 w-px bg-slate-200"></div> {/* Divider */}

                {/* Profile Avatar Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 focus:outline-none transform transition-transform hover:scale-105"
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-slate-400 hover:border-indigo-400 shadow-sm overflow-hidden bg-slate-100 transition-colors">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold text-lg">
                          {user.email ? user.email[0].toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu UI */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden origin-top-right transform transition-all">
                      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                        <p className="text-sm font-extrabold text-slate-900 truncate">{user.displayName || 'User Profile'}</p>
                        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link 
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full text-left px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors flex items-center gap-3"
                        >
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          Account Settings
                        </Link>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-3"
                        >
                          <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Logged Out State */
              <Link 
                to="/login"
                className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* --- MOBILE HAMBURGER TOGGLE --- */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN DRAWER --- */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl overflow-hidden">
          <div className="px-4 py-4 flex flex-col gap-1">
            {user ? (
              <>
                <Link to="/aboutUs" onClick={() => setIsMenuOpen(false)} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${isActive('/aboutUs') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>About Us</Link>
                <Link to="/exams" onClick={() => setIsMenuOpen(false)} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${isActive('/exams') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>Exams</Link>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>Dashboard</Link>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-colors ${isActive('/profile') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}>Account Settings</Link>
                
                <div className="h-px bg-slate-100 my-3"></div>
                
                <Link to="/create-exam" onClick={() => setIsMenuOpen(false)} className="w-full px-4 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-center shadow-md flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Create New Exam
                </Link>
                <button onClick={handleLogout} className="w-full px-4 py-3.5 mt-2 bg-rose-50 text-rose-600 rounded-xl font-bold text-center hover:bg-rose-100 transition-colors">Sign Out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full px-4 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-center shadow-md">
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;