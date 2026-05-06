import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, database } from "./firebase";
import { ref, set } from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import loginGirl from '../assets/images/login_girl.png';
import loginBoy from '../assets/images/login_boy.png';

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  const navigate = useNavigate();
  const createdAt = new Date().toISOString();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    
    try {
      // Register user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate a unique session key
      const sessionKey = uuidv4();
      console.log("Session Key:", sessionKey);

      // Create a reference to the user's data in Realtime Database
      const userRef = ref(database, `Users/${user.uid}`);

      // Store user data along with session key in Firebase Realtime Database
      await set(userRef, {
        email: user.email,
        firstName: fname,
        lastName: lname,
        role: "User",
        createdAt: createdAt,
        sessionKey: sessionKey,
        exams: [], // Initialize with an empty array for exams
      });

      // Store session key in localStorage for persistence
      localStorage.setItem("sessionKey", sessionKey);
      console.log("Stored sessionKey in localStorage:", localStorage.getItem("sessionKey"));

      // Show success message
      toast.success("User Registered Successfully!!", { position: "top-center" });

      // Redirect to the profile page after registration
      navigate("/profile");
    } catch (error) {
      // Handle registration errors
      console.error("Registration Error:", error.message);
      toast.error(error.message, { position: "bottom-center" });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    // {/* ENTIRE SCREEN BACKGROUND */}
    <div className="min-h-screen flex w-full font-sans bg-gradient-to-br from-sky-100 via-white to-blue-50 relative overflow-hidden">
      <ToastContainer />
      
      {/* Universal Soft Decorative Background Blobs */}
      <div className="absolute top-[-0%] left-[-10%] w-[50vw] h-[50vw] bg-blue-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-300/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>

      {/* LEFT SIDE: Branding & Features */}
      <div className="hidden md:flex md:w-1/2 flex-col relative z-10">
        <div className="flex flex-col items-center justify-center h-full py-6 px-6 lg:px-12 w-full max-w-2xl md:ml-auto md:mr-2 xl:mr-2">
          
          {/* Logo & Header */}
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight text-center">Exam Ease Proctor</h1>
          </div>
          <p className="text-slate-600 text-lg mb-4 text-center font-medium">Secure Testing, Simplified. Create your account.</p>

          {/* Scale adjustment for tablets */}
          <div className="relative w-full max-w-md lg:max-w-lg mx-auto h-[450px] mb-4 mt-10 md:scale-[0.80] lg:scale-100 origin-center transition-transform">
            
            {/* Soft Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 bg-sky-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Card 1: Exam Creation */}
            <div className="absolute top-0 left-0 w-64 h-72 bg-white/70 backdrop-blur-xl rounded-3xl border border-white shadow-2xl transform -rotate-3 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 z-10">
              <div className="absolute -top-16 -left-8 w-72 h-72 pointer-events-none">
                <img 
                  src={loginGirl} 
                  alt="Exam Creation" 
                  className="w-full h-full object-contain drop-shadow-2xl" 
                />
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Setup & Create</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Teacher Portal</p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-200/60 rounded-full mb-1.5"></div>
                <div className="w-2/3 h-1.5 bg-slate-200/60 rounded-full"></div>
              </div>
            </div>

            {/* Card 2: AI Proctoring */}
            <div className="absolute bottom-0 right-0 w-64 h-72 bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl transform rotate-3 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 z-20">
              <div className="absolute -top-16 -right-6 w-72 h-72 pointer-events-none">
                <img 
                  src={loginBoy} 
                  alt="AI Proctoring" 
                  className="w-full h-full object-contain drop-shadow-2xl" 
                />
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-sky-400/20 animate-pulse"></div>
                    <svg className="w-5 h-5 text-sky-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Live AI Proctoring</h3>
                    <p className="text-[10px] text-sky-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Active
                    </p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-600/50 rounded-full mb-1.5"></div>
                <div className="w-3/4 h-1.5 bg-slate-600/50 rounded-full"></div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* RIGHT SIDE: Register Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center py-6 px-6 sm:px-12 md:pl-4 md:pr-8 lg:pl-8 lg:pr-24 xl:pl-16 xl:pr-32 relative z-10">
        
        <div className="relative w-full max-w-md mx-auto md:ml-0 bg-white py-8 px-6 lg:px-8 shadow-2xl shadow-slate-200 sm:rounded-3xl border border-slate-200">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
            <p className="text-slate-500 mt-2">Sign up to get started</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* First Name & Last Name (Side-by-Side to save vertical space) */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1 text-left">First Name</label>
                <input
                  type="text"
                  placeholder="First"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-700 shadow-sm"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1 text-left">Last Name</label>
                <input
                  type="text"
                  placeholder="Last"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-700 shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-left">Email Address</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-700 shadow-sm"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-left">Password</label>
              <div className="relative">
                 <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-700 shadow-sm pr-12"
                    required
                 />
                 <button 
                   type="button" 
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-colors"
                 >
                   {showPassword ? (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                   ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                     </svg>
                   )}
                 </button>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 rounded-xl hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/30 font-semibold transition-all transform hover:-translate-y-0.5"
            >
              {isRegistering ? "Registering..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Already registered?{" "}
            <a href="/login" className="font-semibold text-sky-600 hover:text-sky-500 hover:underline transition-colors">
              Login here
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;