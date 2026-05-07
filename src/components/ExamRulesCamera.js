import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { database } from './firebase';
import { ref, get } from 'firebase/database';

const ExamRulesCamera = () => {
  // --- STATE ---
  const [examPath, setExamPath] = useState('');
  const [examDetails, setExamDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Security State
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Camera & Upload State
  const [photo, setPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const navigate = useNavigate();
  const CLOUDINARY_UPLOAD_PRESET = "exam-ease-proctor";

  // --- 1. INITIALIZATION & EXAM FETCH ---
  useEffect(() => {
    const path = localStorage.getItem("examRedirectPath");
    if (!path) {
      navigate('/exams'); // Failsafe if accessed directly without a target
      return;
    }
    
    setExamPath(path);
    const examId = path.split('/').pop(); // Extracts ID from "/take-exam/id"

    const fetchExamDetails = async () => {
      try {
        const snapshot = await get(ref(database, `exams/${examId}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setExamDetails(data);
          
          // Check if password exists
          if (data.examPassword) {
            setIsPasswordProtected(true);
            setIsAuthenticated(false);
          } else {
            setIsPasswordProtected(false);
            setIsAuthenticated(true);
          }
        } else {
          alert("Exam not found. It may have been deleted.");
          navigate('/exams');
        }
      } catch (error) {
        console.error("Error fetching exam:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [navigate]);

  // --- 2. CAMERA INITIALIZATION ---
  useEffect(() => {
    let stream = null;
    
    // Only start camera if they passed the password gate
    if (isAuthenticated) {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error("Error accessing the camera:", error);
          alert("Camera access is required to proceed. Please check your browser permissions.");
        }
      };
      startCamera();
    }

    // Cleanup function: Turn off the webcam when leaving the page!
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isAuthenticated]);

  // --- 3. PASSWORD HANDLER ---
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === examDetails.examPassword) {
      setIsAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  // --- 4. CAMERA ACTIONS ---
  const takePhoto = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");
    setPhoto(imageData);
  };

  const retakePhoto = () => {
    setPhoto(null);
  };

  // --- 5. CLOUDINARY UPLOAD & PROCEED ---
  const handleVerificationAndProceed = async () => {
    if (!photo) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", photo); // Cloudinary accepts base64 Data URLs natively
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch("https://api.cloudinary.com/v1_1/dknoeudoc/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.secure_url) {
        // Save the verification image URL so the Exam page can attach it to the final submission
        localStorage.setItem("verificationImage", data.secure_url);
        
        // Clean up and navigate to the actual exam
        localStorage.removeItem("examRedirectPath");
        navigate(examPath);
      } else {
        throw new Error("Cloudinary upload failed");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Verification failed due to a network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };


  // --- UI RENDERING ---
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Initializing Secure Environment...</p>
      </div>
    );
  }

  // SCREEN A: PASSWORD GATE
  if (isPasswordProtected && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative px-4">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 max-w-md w-full relative z-10 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Restricted Assessment</h2>
          <p className="text-slate-500 text-sm mb-6">
            The examiner has protected <strong>"{examDetails?.title}"</strong>. Please enter the access password to enter the lobby.
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-left">
            <div>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter Exam Password" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-center tracking-widest font-bold"
                required
              />
              {passwordError && <p className="text-rose-500 text-xs font-bold mt-2 text-center">{passwordError}</p>}
            </div>
            <button 
              type="submit" 
              className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              Verify Access
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </form>
          
          <button onClick={() => navigate('/exams')} className="mt-6 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  // SCREEN B: THE SECURE LOBBY (RULES & CAMERA)
  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex items-center justify-center p-4 sm:p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-900 via-slate-900 to-transparent pointer-events-none -z-10"></div>

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-5xl w-full flex flex-col md:flex-row overflow-hidden relative z-10 animate-fade-in-up">
        
        {/* --- LEFT SECTION: DYNAMIC EXAM RULES --- */}
        <div className="w-full md:w-1/2 p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase tracking-widest mb-6 border border-indigo-100">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Pre-Exam Lobby
          </div>
          
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
            {examDetails?.title || "Assessment Initialization"}
          </h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            {examDetails?.description || "Please review the security protocols and verify your identity before proceeding to the examination module."}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Duration</p>
                <p className="text-sm font-bold text-slate-800">{examDetails?.duration || 0} Mins</p>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="bg-slate-100 p-2 rounded-lg text-slate-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Passing</p>
                <p className="text-sm font-bold text-slate-800">{examDetails?.passingPercentage || 50}%</p>
              </div>
            </div>
          </div>

          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Standard Protocols</h3>
          <ul className="space-y-3">
            {examDetails?.strictProctoring && (
              <li className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-3 rounded-xl">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <div>
                  <p className="text-sm font-bold text-amber-900">Strict Monitoring Enabled</p>
                  <p className="text-xs text-amber-700 mt-0.5">Tab switching, exiting full-screen, or looking away from the camera will be recorded as violations.</p>
                </div>
              </li>
            )}
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 mt-0.5"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>
              <span className="text-sm font-medium text-slate-600">Ensure your face is clearly visible and well-lit.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 mt-0.5"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>
              <span className="text-sm font-medium text-slate-600">Ensure a stable internet connection before proceeding.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></div>
              <span className="text-sm font-medium text-slate-600">No earphones, external devices, or secondary displays allowed.</span>
            </li>
          </ul>
        </div>

        {/* --- RIGHT SECTION: IDENTITY VERIFICATION --- */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col items-center justify-center bg-white">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Identity Verification
          </h3>

          {/* Camera / Preview Container */}
          <div className="relative w-full max-w-sm aspect-[4/3] bg-slate-900 rounded-2xl shadow-inner border-4 border-slate-100 overflow-hidden mb-6 flex items-center justify-center">
            {!photo ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                <div className="absolute inset-0 pointer-events-none border-2 border-indigo-500/30 m-4 rounded-xl">
                  {/* Visual Face Guide */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-40 border-2 border-dashed border-white/40 rounded-[40%]"></div>
                </div>
              </>
            ) : (
              <img src={photo} alt="Identity Verification" className="w-full h-full object-cover filter contrast-105" />
            )}
            <canvas ref={canvasRef} className="hidden" width="640" height="480"></canvas>
          </div>

          {/* Actions */}
          <div className="w-full max-w-sm">
            {!photo ? (
              <button
                onClick={takePhoto}
                className="w-full py-3.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Capture Identity
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={retakePhoto}
                  disabled={isUploading}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all border border-slate-200/60"
                >
                  Retake
                </button>
                <button
                  onClick={handleVerificationAndProceed}
                  disabled={isUploading}
                  className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Begin Assessment
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          
          <button onClick={() => navigate('/exams')} className="mt-8 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
            Cancel & Return to Directory
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamRulesCamera;