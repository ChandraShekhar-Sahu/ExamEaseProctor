import React, { useState, useEffect } from 'react';
import { database } from './firebase'; 
import { ref, onValue } from 'firebase/database';
import toast, { Toaster } from 'react-hot-toast'; 
import Navbar from './header';
import Footer from './footer';
import { useNavigate } from 'react-router-dom';

// --- PERFORMANCE: LAZY IMAGE COMPONENT ---
const LazyImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center z-0">
          <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy" 
        onLoad={() => setIsLoaded(true)}
        className={`${className} transition-opacity duration-700 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

const Exams = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();
  
  // --- STATE FOR SEARCH AND FILTERS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); 

  // Fetch exams from Firebase Database
  useEffect(() => {
    const examsRef = ref(database, "exams");

    onValue(examsRef, (snapshot) => {
      const data = snapshot.val();
      const examsList = [];

      if (data) {
        Object.keys(data).forEach((examTitle) => {
          examsList.push({
            id: examTitle, 
            ...data[examTitle],
          });
        });
        setExams(examsList);
      } else {
        setExams([]);
      }
    });
  }, []);

  const isExamAccessible = (startTime, endTime) => {
    if (!startTime || !endTime) return false;
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return now >= start && now <= end;
  };

  const getTimeLeftMessage = (startTime) => {
    if (!startTime) return '';
    const now = new Date().getTime();
    const start = new Date(startTime).getTime();
    const timeLeft = start - now;
    
    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return `Exam starts in ${hours} hour(s) and ${minutes} minute(s)`;
    }
    return '';
  };

  const getTimeLeft = (targetTime) => {
    if (!targetTime) return "Unknown";
    const total = new Date(targetTime).getTime() - new Date().getTime();
    
    if (isNaN(total) || total <= 0) return "Ended";
    
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleTakeExamClick = (exam) => {
    if (!isExamAccessible(exam.startTime, exam.endTime)) {
      toast.error(getTimeLeftMessage(exam.startTime) || 'Exam is not yet available.');
      return false;
    }
    localStorage.setItem("examRedirectPath", `/takeexam/${exam.id}`);
    navigate("/pre-exam");
    return true;
  };

  const uniqueSubjects = ["All", ...new Set(exams.map(exam => exam.subject || "General"))];
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80";

  const filteredExams = exams.filter(exam => {
    const matchesSearch = (exam.title && exam.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
                          (exam.description && exam.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === "All" || (exam.subject || "General") === selectedSubject;
    const isLive = isExamAccessible(exam.startTime, exam.endTime);
    const matchesStatus = statusFilter === "All" ? true : 
                          statusFilter === "Live" ? isLive : !isLive;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <Toaster />

      {/* --- COMPACT HERO SECTION --- */}
      <div className="bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-40 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-indigo-600 blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-cyan-600 blur-[100px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Column */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Secure Assessment Portal
            </div>
            
            {/* SHRUNK TEXT: text-5xl -> text-4xl */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
              Discover Your Next <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Examination</span>
            </h1>

            {/* COMPACT SEARCH BAR */}
            <div className="relative mt-4 max-w-md">
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all text-sm shadow-xl"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Right Column (SHRUNK IMAGE) */}
          <div className="hidden lg:block relative">
            <div className="relative w-full h-[260px] flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80" 
                alt="Tech Assessment" 
                className="w-[70%] h-auto rounded-2xl shadow-2xl object-cover transform rotate-2 hover:rotate-0 transition-transform duration-700 z-10 border border-slate-700"
              />
              {/* Floating Google Logo */}
              <div className="absolute top-4 right-12 bg-white p-2 rounded-xl shadow-xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              {/* Floating Code Icon */}
              <div className="absolute bottom-4 left-12 bg-slate-800 p-2 rounded-xl shadow-xl z-20 border border-slate-700 animate-bounce" style={{ animationDuration: '4s' }}>
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- MAIN CONTENT & FILTERS --- */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-20">
        
        {/* FILTER BAR */}
        <div className="bg-white rounded-xl shadow-sm p-3 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-200">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {uniqueSubjects.map(subject => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedSubject === subject 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>

          <div className="flex gap-1 w-full md:w-auto p-1 bg-slate-100 rounded-lg">
            {["All", "Live", "Upcoming"].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 md:w-20 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  statusFilter === status 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* --- EXAMS GRID --- */}
        {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => {
              const isActive = isExamAccessible(exam.startTime, exam.endTime);
              const imageUrl = exam.image ? exam.image : DEFAULT_IMAGE;
              const displaySubject = exam.subject || "General";
              const eligibilityText = exam.eligibility || "Any Graduate"; 
              
              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group border border-slate-200 hover:-translate-y-1"
                >
                  {/* LAZY LOADED IMAGE HEADER */}
                  <div className="relative h-44 overflow-hidden bg-slate-900 flex items-center justify-center">
                    {/* Background Blur Layer */}
                    <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 blur-xl scale-125 z-0"/>
                    
                    {/* The new Lazy Image */}
                    <LazyImage 
                      src={imageUrl} 
                      alt={exam.title} 
                      className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-20"></div>
                    
                    <div className="absolute top-3 right-3 z-30">
                      {isActive ? (
                        <span className="flex items-center gap-1.5 bg-emerald-500/95 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          LIVE • {getTimeLeft(exam.endTime)}
                        </span>
                      ) : (
                        <span className="bg-white/95 text-slate-700 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md">
                          UPCOMING
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 z-30">
                       <span className="bg-indigo-600/90 text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider backdrop-blur-sm shadow-md">
                        {displaySubject}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-grow flex flex-col relative">
                    <h2 className="text-lg font-bold text-slate-800 mb-1 leading-tight group-hover:text-indigo-600 transition-colors">
                      {exam.title || "Untitled Exam"}
                    </h2>
                    
                    <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-grow">
                      {exam.description || "No description provided for this examination."}
                    </p>

                    <div className="flex flex-col gap-2 border-y border-slate-100 py-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-slate-600 gap-1.5 text-xs font-medium">
                           <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {exam.duration ? `${exam.duration} mins` : "TBA"}
                        </div>
                        <div className="flex items-center text-slate-600 gap-1.5 text-xs font-medium">
                          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          {exam.totalQuestions ? `${exam.totalQuestions} Qs` : "TBA"}
                        </div>
                      </div>

                      <div className="flex items-center text-slate-600 gap-2 text-xs font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path d="M12 14l9-5-9-5-9 5 9 5z" />
                          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                        </svg>
                        {eligibilityText}
                      </div>
                    </div>

                    <button
                      onClick={() => handleTakeExamClick(exam)}
                      disabled={!isActive}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold transition-all duration-300 text-xs tracking-wide mt-auto ${
                        isActive
                          ? "bg-slate-900 text-white shadow-lg hover:bg-indigo-600 hover:-translate-y-0.5"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {isActive ? "START EXAM NOW" : "STARTS " + (exam.startTime ? new Date(exam.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "TBA")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
            <div className="bg-indigo-50 p-4 rounded-full mb-3">
              <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">No exams found</h3>
            <p className="text-slate-500 text-sm text-center max-w-sm">
              We couldn't find any exams matching your current criteria.
            </p>
            <button 
              onClick={() => {setSearchTerm(""); setSelectedSubject("All"); setStatusFilter("All");}}
              className="mt-4 text-indigo-600 text-sm font-bold hover:text-indigo-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Exams;