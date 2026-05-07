import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { database } from '../services/firebase'; 
import { ref, onValue, update, push, get, increment } from 'firebase/database';
import { getAuth } from 'firebase/auth'; 
import FaceUploader from './FaceUploader';

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  
  const [questionIds, setQuestionIds] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(JSON.parse(localStorage.getItem(`userAnswers_${examId}`)) || {});
  
  const [countdown, setCountdown] = useState(null);
  const [examEnded, setExamEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [attemptId, setAttemptId] = useState(localStorage.getItem(`currentAttempt_${examId}`) || null);
  
  // Proctoring State
  const [proofImages, setProofImages] = useState([]);
  const [cheatingOccurred, setCheatingOccurred] = useState(false);
  const [violations, setViolations] = useState({ tab_switch: 0, headMovement: 0, livenessFail: 0, faceIssue: 0 });
  const [cameraReady, setCameraReady] = useState(false);

  // --- REFS ---
  const attemptInitRef = useRef(false);
  const endExamRef = useRef(false);
  const tabSwitchRef = useRef(false);
  const MAX_VIOLATIONS = 10;

  // 1. Fetch User
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
      else navigate('/login');
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. Fetch Exam Data
  useEffect(() => {
    if (!examId) return;
    const fetchExam = async () => {
      try {
        const snapshot = await get(ref(database, `exams/${examId}`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          setExamData(data);

          // Handle Shuffle Questions Logic
          let ids = Object.keys(data.questions);
          if (data.shuffleQuestions) {
            const savedOrder = localStorage.getItem(`shuffledIds_${examId}`);
            if (savedOrder) {
              ids = JSON.parse(savedOrder);
            } else {
              ids = ids.sort(() => Math.random() - 0.5);
              localStorage.setItem(`shuffledIds_${examId}`, JSON.stringify(ids));
            }
          }
          setQuestionIds(ids);
        } else {
          setExamData(null);
        }
      } catch (error) {
        console.error("Error fetching exam:", error);
      }
    };
    fetchExam();
  }, [examId]);

  // 3. Initialize Attempt & Check Limits
  useEffect(() => {
    if (!userId || !examData || attemptInitRef.current) return;
    
    const initialize = async () => {
      attemptInitRef.current = true;

      // If resuming an active attempt, skip the limit check
      if (attemptId) {
        setLoading(false);
        return;
      }

      // Check Max Attempts
      try {
        const attemptsSnap = await get(ref(database, 'examAttempts'));
        let pastAttemptsCount = 0;
        if (attemptsSnap.exists()) {
          const allAttempts = attemptsSnap.val();
          Object.values(allAttempts).forEach(attempt => {
            if (attempt.userId === userId && attempt.examId === examId) {
              pastAttemptsCount++;
            }
          });
        }

        const allowedAttempts = examData.maxAttempts || 1;
        if (pastAttemptsCount >= allowedAttempts) {
          setMaxAttemptsReached(true);
          setLoading(false);
          return;
        }

        // Create New Attempt
        const attemptRef = push(ref(database, "examAttempts"));
        const newAttemptId = attemptRef.key;

        const attemptData = {
          attemptId: newAttemptId,
          examId: examId,
          examTitle: examData?.title || "Untitled",      
          userId: userId,
          score: 0,
          timestamp: new Date().toISOString(),
          cheating: false,
          email: auth.currentUser?.email || "",
        };

        const updates = {};
        updates[`examAttempts/${newAttemptId}`] = attemptData;
        updates[`exams/${examId}/attempts/${newAttemptId}`] = true;
        updates[`Users/${userId}/attempts/${newAttemptId}`] = true;
        if (examData.strictProctoring) {
          updates[`proctoring/${examId}/${userId}/${newAttemptId}/violations`] = {
            tab_switch: 0, headMovement: 0, livenessFail: 0, faceIssue: 0
          };
        }

        await update(ref(database), updates);
        localStorage.setItem(`currentAttempt_${examId}`, newAttemptId);
        setAttemptId(newAttemptId);

      } catch (err) {
        console.error("Failed to initialize attempt:", err);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [userId, examData, attemptId, examId, auth]);

  // 4. Timer Logic
  useEffect(() => {
    if (!examData || loading || maxAttemptsReached) return;

    const storedEndTime = localStorage.getItem(`examEndTime_${examId}`);
    if (storedEndTime) {
      const remaining = Math.floor((parseInt(storedEndTime) - Date.now()) / 1000);
      setCountdown(remaining > 0 ? remaining : 0);
    } else {
      const durationSeconds = examData.duration * 60;
      const endTime = Date.now() + durationSeconds * 1000;
      localStorage.setItem(`examEndTime_${examId}`, endTime);
      setCountdown(durationSeconds);
    }
  }, [examData, examId, loading, maxAttemptsReached]);

  useEffect(() => {
    if (countdown === null || examEnded) return;
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (countdown === 0) {
      handleEndExam();
    }
  }, [countdown, examEnded]);

  // 5. Strict Proctoring (Tab Switches & Auto Submit)
  useEffect(() => {
    if (!attemptId || !examData?.strictProctoring || examEnded) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !tabSwitchRef.current) {
        tabSwitchRef.current = true;
        handleCheating("tab_switch");
        setTimeout(() => { tabSwitchRef.current = false; }, 3000);
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [attemptId, examData, examEnded]);

  useEffect(() => {
    if (examEnded || !examData?.strictProctoring) return;
    const total = Object.values(violations).reduce((a, b) => a + b, 0);
    if (total >= MAX_VIOLATIONS) {
      alert("Exam auto-submitted due to excessive security violations.");
      handleEndExam();
    }
  }, [violations, examEnded, examData]);

  // Fetch real-time violations
  useEffect(() => {
    if (!attemptId || !userId || !examId || !examData?.strictProctoring) return;
    const violationsRef = ref(database, `proctoring/${examId}/${userId}/${attemptId}/violations`);
    const unsubscribe = onValue(violationsRef, (snapshot) => {
      if (snapshot.exists()) setViolations(snapshot.val());
    });
    return () => unsubscribe();
  }, [attemptId, userId, examId, examData]);

  // Prevent accidental back navigation
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!examEnded) {
        event.preventDefault();
        event.returnValue = "Exam is in progress. Leaving will submit your answers.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [examEnded]);

  // Save Answers to LocalStorage
  useEffect(() => {
    localStorage.setItem(`userAnswers_${examId}`, JSON.stringify(userAnswers));
  }, [userAnswers, examId]);

  // --- HANDLERS ---
  const handleAnswerChange = (questionId, optionIndex) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleClearResponse = (questionId) => {
    setUserAnswers(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleCheating = async (type, image) => {
    if (!attemptId || !userId || !examData?.strictProctoring) return;
    setCheatingOccurred(true);
    await update(ref(database, `proctoring/${examId}/${userId}/${attemptId}/violations`), {
      [type]: increment(1)
    });
    if (image) {
      setProofImages(prev => [...prev, { image, type: type }]);
    }
  };

  const handleNormalCapture = (image) => {
    setProofImages(prev => [...prev, { image, type: "normal" }]);
  };

  const uploadPhotoToStorage = async (photo, examId, userId, attemptId) => {
    try {
      const formData = new FormData();
      formData.append("file", photo);
      formData.append("upload_preset", "exam-ease-proctor");
      formData.append("cloud_name", "dknoeudoc");
      formData.append("folder", `exam_proctoring/${examId}/${userId}/${attemptId}`);
      
      const response = await fetch("https://api.cloudinary.com/v1_1/dknoeudoc/image/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Upload failed");
      return data.secure_url;
    } catch (error) {
      console.error("Error uploading photo:", error);
      return null;
    }
  };

  const handleEndExam = async () => {
    if (endExamRef.current || !attemptId || !examData) return;
    endExamRef.current = true;
    setIsSubmitting(true);

    // Calculate Score
    let totalScore = 0;
    Object.keys(examData.questions).forEach((qid) => {
      if (userAnswers[qid] === examData.questions[qid].correctOption) totalScore++;
    });

    setScore(totalScore);
    setExamEnded(true);

    // Update Attempt Data
    await update(ref(database, `examAttempts/${attemptId}`), {
      score: totalScore,
      cheating: cheatingOccurred || Object.values(violations).some(v => v > 0),
      endedAt: new Date().toISOString()
    });

    // Upload Snapshots if strict proctoring is on
    if (examData.strictProctoring && proofImages.length > 0) {
      const uploadedImages = {};
      for (let i = 0; i < proofImages.length; i++) {
        const { image, type } = proofImages[i];
        const url = await uploadPhotoToStorage(image, examId, userId, attemptId);
        if (url) {
          uploadedImages[`img_${i + 1}`] = { url, type: type || "normal", timestamp: new Date().toISOString() };
        }
      }
      await update(ref(database, `proctoring/${examId}/${userId}/${attemptId}`), { snapshots: uploadedImages });
    }

    // Cleanup
    localStorage.removeItem(`userAnswers_${examId}`);
    localStorage.removeItem(`examEndTime_${examId}`);
    localStorage.removeItem(`currentAttempt_${examId}`);
    localStorage.removeItem(`shuffledIds_${examId}`);
  };

  // --- UTILS ---
  const formatCountdown = (seconds) => {
    if (seconds === null) return "--:--";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- RENDERING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-bold tracking-wide">Initializing secure assessment...</p>
        </div>
      </div>
    );
  }

  if (maxAttemptsReached) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-6">You have reached the maximum allowed attempts ({examData?.maxAttempts || 1}) for this assessment.</p>
          <button onClick={() => navigate('/exams')} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-indigo-600 transition-colors">
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  if (!examData) {
    return <p className="text-center text-lg mt-20 font-bold text-slate-500">Assessment not found.</p>;
  }

  if (examEnded) {
    const isPassed = (score / questionIds.length) * 100 >= (examData.passingPercentage || 50);
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-200">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-inner ${isPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isPassed ? (
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Assessment Complete</h2>
          <p className="text-slate-500 mb-8">Your responses have been securely submitted.</p>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Final Score</p>
            <p className="text-5xl font-black text-slate-900">{score} <span className="text-2xl text-slate-400">/ {questionIds.length}</span></p>
          </div>

          <button onClick={() => navigate('/dashboard')} className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold shadow-md hover:bg-indigo-600 transition-colors">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = examData.questions[questionIds[currentQuestionIndex]];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* SECURE HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-md">
            E
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 leading-tight">{examData.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{examData.category || "Assessment"}</span>
              {examData.strictProctoring && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.642 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.358-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd"></path></svg>
                  Proctored
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Time Remaining</p>
            <div className={`text-2xl font-black font-mono tracking-tight ${countdown < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
              {formatCountdown(countdown)}
            </div>
          </div>
          <button
            onClick={handleEndExam}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all flex items-center gap-2"
          >
            {isSubmitting ? 'Submitting...' : 'Finish Exam'}
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full p-4 lg:p-6 gap-6">
        
        {/* MAIN STAGE: QUESTION */}
        <div className="flex-grow flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-10 flex-grow flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <span className="text-sm font-extrabold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">Question {currentQuestionIndex + 1} of {questionIds.length}</span>
              <button 
                onClick={() => handleClearResponse(questionIds[currentQuestionIndex])}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Clear Selection
              </button>
            </div>

            <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mb-8 leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-3 flex-grow">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = userAnswers[questionIds[currentQuestionIndex]] === idx;
                return (
                  <label 
                    key={idx} 
                    className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors ${isSelected ? 'border-indigo-600' : 'border-slate-300'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                    </div>
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={idx}
                      checked={isSelected}
                      onChange={() => handleAnswerChange(questionIds[currentQuestionIndex], idx)}
                      className="hidden"
                    />
                    <span className={`text-base font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{option}</span>
                  </label>
                );
              })}
            </div>

            {/* NAVIGATION CONTROLS */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Previous
              </button>
              
              {currentQuestionIndex === questionIds.length - 1 ? (
                <button
                  onClick={handleEndExam}
                  className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center gap-2 transition-all"
                >
                  Submit Assessment
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questionIds.length - 1, prev + 1))}
                  className="px-8 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-indigo-600 shadow-md flex items-center gap-2 transition-all"
                >
                  Save & Next
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: PALETTE & PROCTORING */}
        <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
          
          {/* Question Palette */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Question Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {questionIds.map((qid, index) => {
                const isAnswered = userAnswers[qid] !== undefined;
                const isCurrent = currentQuestionIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                      isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2' : ''
                    } ${
                      isAnswered ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-indigo-600"></span> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200"></span> Pending
              </div>
            </div>
          </div>

          {/* Hidden Proctoring Component (Only mounts if strict mode is ON) */}
          {examData.strictProctoring && (
             <div className="hidden">
               <FaceUploader
                backendUrl="http://127.0.0.1:8000/api/verify_face/" 
                onViolation={handleCheating}
                examEnded={examEnded}
                onNormalCapture={handleNormalCapture}
              />
             </div>
          )}

          {examData.strictProctoring && (
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 mt-auto">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                <div>
                  <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">Live Monitoring</p>
                  <p className="text-[10px] font-medium text-amber-700 leading-relaxed">Your webcam and browser activity are being actively recorded. Navigating away from this tab will result in a violation.</p>
                </div>
              </div>
            </div>
          )}
          
        </div>

      </main>
    </div>
  );
};

export default TakeExam;