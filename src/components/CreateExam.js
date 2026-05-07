import React, { useState, useEffect } from 'react';
import { database, auth } from '../services/firebase';
import { ref, set, push } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Navbar from './header';

const CreateExam = () => {
  // --- EXAM SETTINGS STATE ---
  const [examTitle, setExamTitle] = useState('');
  const [examCategory, setExamCategory] = useState('');
  const [examDescription, setExamDescription] = useState('');
  
  // Image Preview State (Memory Leak Fix)
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(''); 
  
  // Scheduling State
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [examDuration, setExamDuration] = useState('');
  
  // Eligibility & Security Settings
  const [eligibility, setEligibility] = useState('anyone'); 
  const [passingPercentage, setPassingPercentage] = useState('50');
  const [maxAttempts, setMaxAttempts] = useState('1'); // NEW: Max attempts
  const [examPassword, setExamPassword] = useState(''); // NEW: Optional Password
  const [strictProctoring, setStrictProctoring] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  
  // --- BUILDER STATE ---
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState(0);
  const [isMCQ, setIsMCQ] = useState(true);
  
  const [questions, setQuestions] = useState([]);
  const [userID, setUserID] = useState(null);
  const [hasTextBased, setHasTextBased] = useState(false);
  
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const CLOUDINARY_UPLOAD_PRESET = "exam-ease-proctor"; 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserID(user.uid);
    });
    return () => unsubscribe();
  }, []);

  // --- LOGIC ---

  // Image Local Preview
  const handleImageSelection = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImageFile(file);
    const localPreview = URL.createObjectURL(file);
    setImagePreviewUrl(localPreview);
  };

  const addQuestion = () => {
    if (isMCQ) {
      if (questionText.trim() && options.every((opt) => opt.trim() !== '')) {
        setQuestions([...questions, { type: 'mcq', questionText, options: [...options], correctOption: parseInt(correctOption, 10) }]);
        setQuestionText(''); setOptions(['', '', '', '']); setCorrectOption(0);
      } else {
        alert('Please complete the question text and all 4 options.');
      }
    } else {
      if (questionText.trim()) {
        setQuestions([...questions, { type: 'text-based', questionText }]);
        setHasTextBased(true); setQuestionText('');
      } else {
        alert('Please enter a question for the text-based format.');
      }
    }
  };

  const handleEditQuestion = (index) => {
    const q = questions[index];
    setQuestionText(q.questionText);
    if (q.type === 'mcq') {
      setIsMCQ(true); setOptions([...q.options]); setCorrectOption(q.correctOption);
    } else {
      setIsMCQ(false);
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleDeleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreateExam = async () => {
    if (!examTitle || !examCategory || !startTime || !endTime || !examDuration || questions.length === 0 || !userID) {
      alert("Please fill out all required Exam Settings and add at least one question.");
      setShowReviewModal(false);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload Image to Cloudinary ONLY upon publishing
      let finalImageUrl = null;
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append("file", selectedImageFile);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET); 

        const uploadRes = await fetch("https://api.cloudinary.com/v1_1/dknoeudoc/image/upload", {
          method: "POST", body: formData
        });
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.secure_url;
      }

      // 2. Save entire payload to Firebase
      const examRef = push(ref(database, "exams"));
      const examId = examRef.key;

      await set(examRef, {
        title: examTitle,
        category: examCategory,
        description: examDescription,
        coverImage: finalImageUrl,
        eligibility: eligibility,
        passingPercentage: parseInt(passingPercentage, 10),
        maxAttempts: parseInt(maxAttempts, 10) || 1, // Store max attempts
        examPassword: examPassword.trim() || null, // Store password (or null if empty)
        strictProctoring: strictProctoring,
        shuffleQuestions: shuffleQuestions,
        createdAt: new Date().toISOString(),
        startTime,
        endTime,
        duration: examDuration,
        mcq: !hasTextBased,
        questions: questions.reduce((acc, question, index) => {
          acc[`questionID${index + 1}`] = question;
          return acc;
        }, {}),
      });

      await set(ref(database, `examOwnership/${examId}`), { owner: userID });
      await set(ref(database, `user_created_exams/${userID}/${examId}`), true);

      alert("Exam created and published successfully!");
      navigate(`/dashboard`);
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Something went wrong while creating the exam.");
    } finally {
      setIsSubmitting(false);
      setShowReviewModal(false);
    }
  };

  // Toggle switch UI component
  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button 
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-20 relative">
      
      {/* SaaS Blueprint Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-indigo-50/50 via-slate-50/20 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10">
        <Navbar />
        
        {/* --- HEADER --- */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 pt-28 pb-6 px-4 sm:px-6 lg:px-8 shadow-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Create Assessment</h1>
              <p className="text-slate-500 text-sm mt-1">Configure metadata, exam rules, and build your questions.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowReviewModal(true)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Review & Publish
              </button>
            </div>
          </div>
        </div>

        {/* --- BUILDER WORKSPACE --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: EXAM SETTINGS */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto no-scrollbar pb-10">
              
              {/* 1. Basic Info & Media */}
              <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Basic Information
                  </h2>
                </div>
                <div className="p-5 space-y-5">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Cover Banner (Optional)</label>
                    <div className="relative group w-full h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors overflow-hidden flex flex-col items-center justify-center cursor-pointer">
                      {imagePreviewUrl ? (
                        <>
                          <img src={imagePreviewUrl} alt="Cover Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-slate-900/70 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 text-slate-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <span className="text-xs font-bold text-slate-500">Select Image File</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageSelection} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Exam Title <span className="text-indigo-600">*</span></label>
                    <input type="text" value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="e.g. Midterm Physics" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Category <span className="text-indigo-600">*</span></label>
                    <select value={examCategory} onChange={(e) => setExamCategory(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all appearance-none cursor-pointer">
                      <option value="" disabled>Select Category</option>
                      <option value="Computer Science">Computer Science & IT</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Medical">Medical & Biology</option>
                      <option value="General Aptitude">General Aptitude</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Description / Rules <span className="text-indigo-600">*</span></label>
                    <textarea value={examDescription} onChange={(e) => setExamDescription(e.target.value)} placeholder="Provide instructions to candidates..." rows="3" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-none"></textarea>
                  </div>
                </div>
              </div>

              {/* 2. Eligibility & Advanced Settings */}
              <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Eligibility & Security
                  </h2>
                </div>
                <div className="p-5 space-y-5">
                  
                  {/* Target Audience */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Target Audience</label>
                    <select value={eligibility} onChange={(e) => setEligibility(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all appearance-none cursor-pointer">
                      <option value="anyone">Open to Everyone</option>
                      <option value="12th_pass">12th Pass / High School</option>
                      <option value="undergraduate">Undergraduate Students</option>
                      <option value="postgraduate">Postgraduate / Masters</option>
                      <option value="professional">Working Professionals</option>
                    </select>
                  </div>

                  {/* Passing & Attempts Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Passing Criteria</label>
                      <div className="relative">
                        <input type="number" value={passingPercentage} onChange={(e) => setPassingPercentage(e.target.value)} min="1" max="100" className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-bold">%</div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Max Attempts</label>
                      <div className="relative">
                        <input type="number" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} min="1" placeholder="e.g. 1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
                      </div>
                    </div>
                  </div>

                  {/* Password Protection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Exam Password (Optional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <input 
                        type="text" 
                        value={examPassword} 
                        onChange={(e) => setExamPassword(e.target.value)} 
                        placeholder="Leave blank for open access" 
                        className="w-full pl-9 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder:text-slate-400" 
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <ToggleSwitch label="Strict Proctoring" description="Enable camera and tab-switch monitoring." enabled={strictProctoring} onChange={() => setStrictProctoring(!strictProctoring)} />
                    <ToggleSwitch label="Shuffle Questions" description="Randomize question order for each candidate." enabled={shuffleQuestions} onChange={() => setShuffleQuestions(!shuffleQuestions)} />
                  </div>

                </div>
              </div>

              {/* 3. Scheduling */}
              <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Scheduling
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Start Time <span className="text-indigo-600">*</span></label>
                    <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">End Time <span className="text-indigo-600">*</span></label>
                    <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Duration (Minutes) <span className="text-indigo-600">*</span></label>
                    <input type="number" value={examDuration} onChange={(e) => setExamDuration(e.target.value)} placeholder="e.g. 60" min="1" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all" />
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT: QUESTION BUILDER */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              <div className="bg-white rounded-2xl shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
                
                <div className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-lg font-extrabold text-slate-900">Draft Question</h2>
                    
                    <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto border border-slate-200/60">
                      <button onClick={() => setIsMCQ(true)} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-bold transition-all ${isMCQ ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>
                        Multiple Choice
                      </button>
                      <button onClick={() => setIsMCQ(false)} className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!isMCQ ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'}`}>
                        Text-Based
                      </button>
                    </div>
                  </div>

                  <div className="mb-8">
                    <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Type your question here..." rows="3" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all text-base font-medium resize-none placeholder-slate-400"></textarea>
                  </div>

                  {isMCQ && (
                    <div className="space-y-3 mb-8">
                      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Define Options & Select Correct Answer</p>
                      {options.map((option, index) => (
                        <div key={index} className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${correctOption === index ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                          <div className="flex items-center justify-center pl-3 py-2 cursor-pointer" onClick={() => setCorrectOption(index)}>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${correctOption === index ? 'border-indigo-600' : 'border-slate-300'}`}>
                              {correctOption === index && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>}
                            </div>
                          </div>
                          <input type="text" value={option} onChange={(e) => { const newOptions = [...options]; newOptions[index] = e.target.value; setOptions(newOptions); }} placeholder={`Option ${String.fromCharCode(65 + index)}`} className="flex-grow py-2 pr-3 bg-transparent text-sm text-slate-900 focus:outline-none placeholder-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-5 border-t border-slate-100">
                    <button onClick={addQuestion} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm shadow-md">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Add to Roster
                    </button>
                  </div>
                </div>
              </div>

              {/* Roster (Added Questions) */}
              <div className="mt-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Question Roster</span>
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-xs">{questions.length} Added</span>
                </h3>
                
                {questions.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <p className="text-slate-600 text-sm font-semibold">Your roster is empty.</p>
                    <p className="text-slate-500 text-xs mt-1">Draft a question above and add it to the exam.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q, index) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 group hover:border-slate-300 transition-colors shadow-sm">
                        <div className="flex-shrink-0 pt-0.5">
                          <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center border border-slate-200">{index + 1}</span>
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                              {q.type === 'mcq' ? 'Multiple Choice' : 'Text Based'}
                            </span>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEditQuestion(index)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors" title="Edit">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button onClick={() => handleDeleteQuestion(index)} className="p-1 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">{q.questionText}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* --- REVIEW & PUBLISH MODAL --- */}
        {showReviewModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-slate-900">Review & Publish</h2>
                <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-6 bg-slate-50">
                <div className="bg-white p-5 rounded-xl border border-slate-200 mb-5 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{examCategory || 'Uncategorized'}</span>
                    {strictProctoring && <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> Strict Mode</span>}
                    {examPassword && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Secured</span>}
                  </div>
                  <h3 className="font-bold text-slate-900 truncate">{examTitle || 'Untitled Assessment'}</h3>
                  
                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-500 border-t border-slate-100 pt-3">
                    <span>Pass: {passingPercentage}%</span>
                    <span>Attempts: {maxAttempts || 1}</span>
                    <span>Target: {eligibility === 'anyone' ? 'Everyone' : eligibility.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                    <span className="block text-2xl font-black text-slate-900">{questions.length}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Questions</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                    <span className="block text-2xl font-black text-slate-900">{examDuration || '0'}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Minutes</span>
                  </div>
                </div>

                <div className="text-xs font-medium text-slate-500 text-center px-4">
                  Once published, this exam structure is locked to ensure integrity for all candidates.
                </div>
              </div>

              <div className="px-6 py-5 bg-white border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200/50"
                  disabled={isSubmitting}
                >
                  Go Back
                </button>
                <button 
                  onClick={handleCreateExam}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-lg transition-all flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Publish Exam'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateExam;