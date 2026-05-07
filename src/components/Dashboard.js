import React, { useState, useEffect } from 'react';
import { auth, database } from '../services/firebase'; 
import { onAuthStateChanged } from 'firebase/auth'; 
import { ref, get } from "firebase/database"; 
import Navbar from './header';
import Footer from './footer';


// --- CUSTOM UI COMPONENTS ---
const ScoreRing = ({ score }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="transparent" r={radius} cx="32" cy="32" />
        <circle 
          className={`${color} transition-all duration-1000 ease-out`} 
          strokeWidth="4" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round" 
          stroke="currentColor" 
          fill="transparent" 
          r={radius} cx="32" cy="32" 
        />
      </svg>
      <span className="absolute text-sm font-black text-slate-800">{score}</span>
    </div>
  );
};

const Dashboard = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [activeTab, setActiveTab] = useState('examsTaken'); 
  
  // NEW: Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortNewest, setSortNewest] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState([]);
  const [candidates, setCandidates] = useState([]); 

  const [selectedExamId, setSelectedExamId] = useState(null);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // --- FIREBASE LOGIC ---
  const fetchExamsCreatedByUser = async (userId) => {
    try {
      const createdRef = ref(database, `user_created_exams/${userId}`);
      const snapshot = await get(createdRef);
      if (!snapshot.exists()) return [];

      const examIds = Object.keys(snapshot.val());
      const examsData = await Promise.all(
        examIds.map(async (examId) => {
          const examRef = ref(database, `exams/${examId}`);
          const examSnap = await get(examRef);
          if (!examSnap.exists()) return null;
          const data = examSnap.val();
          return {
            id: examId,
            title: data.title || "Untitled Assessment",
            description: data.description,
            startTime: data.startTime,
            endTime: data.endTime,
            // Fallback timestamp for sorting if needed
            timestamp: data.startTime || new Date().toISOString(),
          };
        })
      );
      return examsData.filter(Boolean);
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const fetchExamsTakenByUser = async (userId) => {
    try {
      const attemptsRef = ref(database, `examAttempts`);
      const snapshot = await get(attemptsRef);
      if (!snapshot.exists()) return [];
      const data = snapshot.val();
      return Object.values(data)
        .filter(a => a.userId === userId)
        .map(a => ({
          examId: a.examId,
          examTitle: a.examTitle,
          score: a.score || 0,
          cheating: a.cheating,
          timestamp: a.timestamp,
          attemptId: a.attemptId,
        }));
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  useEffect(() => {
    const getExams = async () => {
      if (userId) {
        setSearchTerm(''); // Clear search when switching tabs
        if (activeTab === 'examsCreated') {
          const examsData = await fetchExamsCreatedByUser(userId);
          setExams(examsData);
        } else if (activeTab === 'examsTaken') {
          const examsData = await fetchExamsTakenByUser(userId);
          setExams(examsData);
        } else {
          setExams([]);
        }
      }
    };
    getExams();
  }, [userId, activeTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); 
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe(); 
  }, []);

  const handleViewCandidates = async (examId) => {
    try {
      const snapshot = await get(ref(database, `examAttempts`));
      if (!snapshot.exists()) return;
      const data = snapshot.val();
      const filtered = Object.values(data)
        .filter(a => a.examId === examId)
        .map(a => ({
          userId: a.userId,
          email: a.email || "N/A",
          score: a.score,
          attemptId: a.attemptId,
        }))
        .sort((a, b) => b.score - a.score);

      setCandidates(filtered);
      setSelectedExamId(examId);
      setShowCandidatesModal(true);
    } catch (err) {
      console.error(err);
    }
  };
  
  const showMoreDetails = async (candidate) => {
    try {
      const { userId, attemptId } = candidate;
      const basePath = `proctoring/${selectedExamId}/${userId}/${attemptId}`;
      const [violSnap, imgSnap] = await Promise.all([
        get(ref(database, `${basePath}/violations`)),
        get(ref(database, `${basePath}/snapshots`)),
      ]);
      setCandidateDetails({
        violations: violSnap.exists() ? violSnap.val() : {},
        images: imgSnap.exists() ? Object.values(imgSnap.val()) : [],
      });
      setShowDetailsModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const calculateRisk = (violations) => {
    const face = violations.faceIssue || 0;
    const head = violations.headMovement || 0;
    const live = violations.livenessFail || 0;
    const tab = violations.tab_switch || 0;
    const score = (face * 3) + (head * 2) + (live * 3) + (tab * 1); 

    if (score >= 10) return { level: "HIGH RISK", bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200" };
    if (score >= 5) return { level: "MEDIUM RISK", bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" };
    return { level: "LOW RISK", bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" };
  };

  const handleViewReport = async (exam) => {
    try {
      const { examId, attemptId } = exam;
      const basePath = `proctoring/${examId}/${userId}/${attemptId}`;
      const [violSnap, imgSnap] = await Promise.all([
        get(ref(database, `${basePath}/violations`)),
        get(ref(database, `${basePath}/snapshots`)),
      ]);
      const violations = violSnap.exists() ? violSnap.val() : {};
      const images = imgSnap.exists() ? Object.values(imgSnap.val()) : [];
      setReportData({ violations, images });
      setShowReportModal(true);
    } catch (err) {
      console.error("Error fetching report:", err);
    }
  };

  // --- HELPER FUNCTIONS ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const calculateAverageScore = () => {
    if (activeTab !== 'examsTaken' || exams.length === 0) return 0;
    const total = exams.reduce((acc, curr) => acc + (curr.score || 0), 0);
    return Math.round(total / exams.length);
  };

  const isExamActive = (endTime) => {
    if (!endTime) return false;
    return new Date().getTime() <= new Date(endTime).getTime();
  };

  // --- NEW: SEARCH & SORT ENGINE ---
  const processedExams = exams
    .filter((exam) => {
      // 1. Filter by Search Term
      const searchLower = searchTerm.toLowerCase();
      if (!searchLower) return true; // If search is empty, show all

      if (activeTab === 'examsCreated') {
        return (
          (exam.title && exam.title.toLowerCase().includes(searchLower)) ||
          (exam.description && exam.description.toLowerCase().includes(searchLower))
        );
      } else {
        return exam.examTitle && exam.examTitle.toLowerCase().includes(searchLower);
      }
    })
    .sort((a, b) => {
      // 2. Sort by Date
      const dateA = new Date(a.timestamp || a.endTime || a.startTime).getTime();
      const dateB = new Date(b.timestamp || b.endTime || b.startTime).getTime();
      
      // Handle invalid dates safely
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      
      return sortNewest ? dateB - dateA : dateA - dateB;
    });


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 font-medium tracking-wide">Syncing data...</p>
        </div>
      </div>
    );
  }

  const risk = reportData ? calculateRisk(reportData.violations) : null;
  const averageScore = calculateAverageScore();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Navbar />
      
      {/* --- COMMAND CENTER HEADER --- */}
      <div className="bg-[#0B1120] relative pt-28 pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 text-indigo-300 text-xs font-semibold mb-4 border border-slate-700/50 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Proctor-AI Secure Mode
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
              {getGreeting()}.
            </h1>
            <p className="text-slate-400 text-lg max-w-xl">
              Welcome to your command center. Monitor your assessments, track candidate risk profiles, and analyze performance.
            </p>
          </div>
        </div>
      </div>

      {/* --- FLOATING QUICK-STATS --- */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/40 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Total {activeTab === 'examsTaken' ? 'Assessments' : 'Exams Created'}</p>
              <h3 className="text-2xl font-black text-slate-800">{exams.length}</h3>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/40 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div className="flex-grow">
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">{activeTab === 'examsTaken' ? 'Average Score' : 'Engagement Rate'}</p>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-slate-800">{activeTab === 'examsTaken' ? `${averageScore}%` : 'N/A'}</h3>
                {activeTab === 'examsTaken' && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${averageScore}%` }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/40 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shadow-inner">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Active Role</p>
              <h3 className="text-lg font-bold text-slate-800">
                {activeTab === 'examsTaken' ? 'Student Portal' : 'Administrator'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* --- SLEEK NAVIGATION & WORKING UTILITY BAR --- */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 gap-4">
          
          <div className="flex">
            <button
              onClick={() => setActiveTab('examsTaken')}
              className={`py-4 px-6 text-sm font-bold transition-all relative ${
                activeTab === 'examsTaken' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Exams Taken
              {activeTab === 'examsTaken' && <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-md"></span>}
            </button>
            <button
              onClick={() => setActiveTab('examsCreated')}
              className={`py-4 px-6 text-sm font-bold transition-all relative ${
                activeTab === 'examsCreated' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Exams Managed
              {activeTab === 'examsCreated' && <span className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-indigo-600 rounded-t-md"></span>}
            </button>
          </div>

          {/* THE WIRED-UP UTILITY BAR */}
          <div className="flex gap-2 pb-2 md:pb-0">
             <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                  type="text" 
                  placeholder="Search exams..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm w-full md:w-64 transition-all" 
                />
             </div>
             
             {/* Sort Toggle Button */}
             <button 
               onClick={() => setSortNewest(!sortNewest)}
               title={sortNewest ? "Sort Oldest First" : "Sort Newest First"}
               className={`p-2 border rounded-lg shadow-sm transition-colors flex items-center justify-center ${sortNewest ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                {sortNewest ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                ) : (
                  <svg className="w-5 h-5 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                )}
             </button>
          </div>
        </div>
      </div>

      {/* --- EXAMS GRID --- */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        
        {processedExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* EXAMS CREATED CARDS (Admin Layout) */}
            {activeTab === 'examsCreated' && processedExams.map((exam) => {
              const active = isExamActive(exam.endTime);
              return (
                <div key={exam.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  
                  <div className="flex justify-between items-start mb-5">
                    <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl group-hover:bg-indigo-50 transition-colors">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {active ? 'Live Now' : 'Ended'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-grow">{exam.description || "No description provided."}</p>
                  
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-6 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100 uppercase tracking-wide">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Due: {new Date(exam.endTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <button
                    onClick={() => handleViewCandidates(exam.id)}
                    className="w-full py-3 bg-slate-900 text-white hover:bg-indigo-600 rounded-xl font-bold transition-all text-sm shadow-md hover:shadow-indigo-500/20"
                  >
                    View Roster & Reports
                  </button>
                </div>
              );
            })}

            {/* EXAMS TAKEN CARDS (Student Grade Layout) */}
            {activeTab === 'examsTaken' && processedExams.map((exam, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{exam.examTitle || "Untitled Exam"}</h3>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mt-2 uppercase tracking-wide">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(exam.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ScoreRing score={exam.score} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto pt-5 border-t border-slate-100">
                  <button
                    onClick={() => handleViewReport(exam)}
                    className="py-2.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl font-bold transition-colors text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Full Report
                  </button>
                  <button
                    onClick={() => (window.location.href = '/exams')}
                    className="py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-100 hover:border-indigo-600 rounded-xl font-bold transition-all text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Reattempt
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
            <div className="bg-slate-50 p-5 rounded-2xl mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Records Found</h3>
            <p className="text-slate-500 text-center max-w-sm">
              {searchTerm 
                ? `We couldn't find any results for "${searchTerm}".` 
                : activeTab === 'examsCreated' 
                  ? "You haven't managed any assessments yet. Switch to the creator portal to get started." 
                  : "You haven't taken any exams yet. Head to the directory to start an assessment."}
            </p>
          </div>
        )}
      </main>

      <Footer />

      {/* --- MODALS (UNTOUCHED) --- */}

      {showCandidatesModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-extrabold text-slate-800">Candidate Results</h2>
              <button onClick={() => setShowCandidatesModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex-grow">
              {candidates.length > 0 ? (
                <div className="space-y-3">
                  {candidates.map((c, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors bg-white">
                      <div>
                        <p className="font-bold text-slate-800 mb-0.5">{c.email}</p>
                        <p className="text-xs font-semibold text-indigo-600">Score: {c.score}</p>
                      </div>
                      <button
                        onClick={() => showMoreDetails(c)}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                      >
                        View Proctoring
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-10">No candidates have taken this exam yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && candidateDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-[60] p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-extrabold text-slate-800">Candidate Proctoring Logs</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Detected Violations</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-black text-slate-800">{candidateDetails.violations.faceIssue || 0}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">Face Issues</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-black text-slate-800">{candidateDetails.violations.headMovement || 0}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">Head Mvmts</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-black text-slate-800">{candidateDetails.violations.livenessFail || 0}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">Liveness Fails</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-2xl font-black text-slate-800">{candidateDetails.violations.tab_switch || 0}</div>
                  <div className="text-xs font-semibold text-slate-500 mt-1">Tab Switches</div>
                </div>
              </div>

              <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Event Snapshots</h3>
              {candidateDetails.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {candidateDetails.images.map((img, i) => (
                    <div key={i} className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-200 relative group">
                      <img src={img.url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all" alt="Violation snapshot" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500 text-sm">
                  No snapshots recorded for this candidate.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showReportModal && reportData && risk && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-extrabold text-slate-800">Your Proctoring Report</h2>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1 border border-slate-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between ${risk.bg} ${risk.border}`}>
                <div>
                  <h3 className={`text-xs font-extrabold uppercase tracking-widest ${risk.text} mb-1`}>Calculated Risk Profile</h3>
                  <p className={`text-xl font-black ${risk.text}`}>{risk.level}</p>
                </div>
                <div className={`p-3 rounded-full bg-white/50 ${risk.text}`}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider border-b border-slate-200 pb-2">Violation Breakdown</h3>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-600">Face Not Detected</span>
                    <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-md shadow-sm border border-slate-100">{reportData.violations.faceIssue || 0}</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-600">Suspicious Head Movements</span>
                    <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-md shadow-sm border border-slate-100">{reportData.violations.headMovement || 0}</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-600">Liveness Verification Fails</span>
                    <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-md shadow-sm border border-slate-100">{reportData.violations.livenessFails || 0}</span>
                  </li>
                  <li className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-600">Unauthorized Tab Switches</span>
                    <span className="font-bold text-slate-900 bg-white px-3 py-1 rounded-md shadow-sm border border-slate-100">{reportData.violations.tab_switch || 0}</span>
                  </li>
                </ul>
              </div>

              <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider">Recorded Snapshots</h3>
              {reportData.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {reportData.images.map((img, i) => (
                    <img key={i} src={img.url} className="rounded-lg w-full aspect-video object-cover border border-slate-200" alt="Proctoring snapshot" />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500 text-sm">
                  No images were flagged during your session.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;