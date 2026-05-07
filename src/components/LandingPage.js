import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./header";
import Footer from "./footer";

function LandingPage() {
    const navigate = useNavigate();
    const howItWorksRef = useRef(null);

    const scrollToHowItWorks = () => {
        howItWorksRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#FDFDFD] font-sans selection:bg-teal-100 selection:text-teal-900">
            <Navbar />
            
            <main className="flex-grow">
                
                {/* --- 1. THE HERO: Product-First Design --- */}
                <section className="relative pt-24 lg:pt-28 pb-16 lg:pb-24 overflow-hidden bg-white">
                    {/* Background Blueprint Grid */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    
                    {/* Glowing Accent Blobs */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-teal-400/10 blur-[120px] rounded-full pointer-events-none"></div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center max-w-4xl mx-auto mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-widest mb-6 border border-slate-200 shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                                AI-Powered Proctoring 2.0
                            </div>
                            
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
                                Secure assessments for the <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">
                                    Modern Classroom.
                                </span>
                            </h1>
                            
                            <p className="text-lg md:text-xl text-slate-500 font-medium mb-8 max-w-2xl mx-auto leading-relaxed">
                                ExamEase combines advanced biometrics and behavioral AI to guarantee academic integrity without compromising candidate privacy.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button 
                                    className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
                                    onClick={() => navigate('/login')}
                                >
                                    Start Proctoring Now
                                    <svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                                <button 
                                    className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2"
                                    onClick={scrollToHowItWorks}
                                >
                                    Watch Product Tour
                                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* --- Floating Product Mockup --- */}
                        <div className="relative max-w-5xl mx-auto">
                            <div className="absolute inset-0 bg-gradient-to-b from-teal-500/20 to-transparent blur-3xl -z-10 transform scale-90"></div>
                            
                            <div className="bg-slate-900 rounded-[28px] md:rounded-[40px] p-2 md:p-3 shadow-2xl border border-slate-800 overflow-hidden">
                                <div className="bg-white rounded-[20px] md:rounded-[32px] overflow-hidden border border-slate-200">
                                    {/* Simulated Dashboard Header */}
                                    <div className="h-10 md:h-12 bg-slate-50 border-b border-slate-100 flex items-center px-4 md:px-6 gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-rose-400/80"></div>
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-400/80"></div>
                                            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-400/80"></div>
                                        </div>
                                        <div className="mx-auto bg-slate-200 h-3 md:h-4 w-32 md:w-48 rounded-full"></div>
                                    </div>
                                    
                                    {/* FIX: Constrained image height with object-cover and object-top to prevent screen blowout */}
                                    <img 
                                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80" 
                                        alt="Product Interface" 
                                        className="w-full h-48 sm:h-64 md:h-80 lg:h-[400px] object-cover object-top opacity-90 hover:opacity-100 transition-opacity"
                                    />
                                </div>
                            </div>
                            
                            {/* Floating "AI Detected" Badge */}
                            <div className="absolute -right-6 top-1/2 bg-white p-4 rounded-2xl shadow-2xl border border-teal-100 hidden lg:block animate-bounce">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Live Analysis</p>
                                        <p className="text-sm font-bold text-slate-900">User Identity Verified</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 2. THE BENTO GRID: Features --- */}
                <section className="py-32 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="mb-20">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Engineered for integrity.</h2>
                            <p className="text-lg text-slate-500 max-w-2xl">We combined the best of AI vision and system-level security to create an unbreakable environment.</p>
                        </div>

                        {/* Fluid rows on mobile to prevent text leaking, strict 320px height ONLY on desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-auto md:auto-rows-[320px]">
                            
                            {/* Real-time Monitoring */}
                            <div className="col-span-1 md:col-span-2 row-span-1 bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 group flex flex-col justify-between">
                                <div className="w-12 h-12 bg-slate-900 text-teal-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Behavioral Tracking</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">Our AI detects gaze shifts and presence abnormalities in real-time, ensuring candidates stay focused.</p>
                                </div>
                            </div>

                            {/* Biometric Logic */}
                            <div className="col-span-1 md:col-span-1 md:row-span-2 bg-slate-900 rounded-[32px] p-8 shadow-2xl relative overflow-hidden flex flex-col text-white min-h-[320px]">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]"></div>
                                <h3 className="text-2xl font-black mb-4 z-10">Advanced Biometrics</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8 z-10">Facial recognition signatures are encrypted and verified against session initialization to prevent impersonation.</p>
                                <div className="mt-auto bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-teal-400">Verifying...</span>
                                    </div>
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div className="h-1 bg-white/10 rounded-full w-full"></div>
                                        <div className="h-1 bg-white/10 rounded-full w-[80%]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Secure Interface */}
                            <div className="col-span-1 md:col-span-1 row-span-1 bg-teal-500 rounded-[32px] p-8 text-white flex flex-col justify-end group min-h-[320px]">
                                <svg className="w-10 h-10 mb-auto group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                <div>
                                    <h3 className="text-xl font-bold">Lockdown Terminal</h3>
                                    <p className="text-teal-50 text-sm mt-2">Restricts unauthorized browser capabilities.</p>
                                </div>
                            </div>

                            {/* Comprehensive Logs */}
                            <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
                                <div className="mb-6">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Automated Evidence</h3>
                                    <p className="text-slate-500 font-medium">Export full behavioral reports with visual proofs.</p>
                                </div>
                                <div className="w-full grid grid-cols-2 gap-3 mt-auto">
                                    <div className="h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-tighter">Snapshot_01</div>
                                    <div className="h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-tighter">Violation_Log</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* --- 3. HOW IT WORKS: The Pipeline --- */}
                <section ref={howItWorksRef} className="py-32 bg-white border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-24">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Deploy in minutes.</h2>
                            <p className="text-lg text-slate-500">A simplified three-pillar workflow designed for scalability.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden lg:block absolute top-24 left-0 w-full h-px bg-slate-100 -z-10"></div>
                            
                            {/* Step 1 */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="w-20 h-20 bg-white border-2 border-slate-100 shadow-xl rounded-[28px] flex items-center justify-center mb-8 group-hover:border-teal-500 transition-colors">
                                    <span className="text-3xl font-black text-slate-900 group-hover:text-teal-600">01</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Architect Exam</h3>
                                <p className="text-slate-500 leading-relaxed text-sm max-w-xs">Upload questions, set timing, and toggle AI rules in our powerful intuitive builder.</p>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="w-20 h-20 bg-slate-900 shadow-2xl rounded-[28px] flex items-center justify-center mb-8 border-2 border-slate-800 group-hover:scale-105 transition-transform">
                                    <span className="text-3xl font-black text-teal-400">02</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Live Monitoring</h3>
                                <p className="text-slate-500 leading-relaxed text-sm max-w-xs">Students enter a secured Lobby for identity verification. AI tracks behavior invisibly.</p>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center text-center group">
                                <div className="w-20 h-20 bg-white border-2 border-slate-100 shadow-xl rounded-[28px] flex items-center justify-center mb-8 group-hover:border-teal-500 transition-colors">
                                    <span className="text-3xl font-black text-slate-900 group-hover:text-teal-600">03</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Review & Score</h3>
                                <p className="text-slate-500 leading-relaxed text-sm max-w-xs">Access deep analytics and behavioral proofs instantly after the session ends.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 4. FINAL CTA: Dark Glassmorphism --- */}
                <section className="py-24 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-slate-900 rounded-[48px] p-8 md:p-20 text-center relative overflow-hidden border border-slate-800 shadow-2xl shadow-slate-900/40">
                            {/* Decorative orbs */}
                            <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                            
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">
                                    Ready to set the gold standard <br className="hidden md:block" />
                                    for academic integrity?
                                </h2>
                                <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto font-medium">
                                    Join forward-thinking institutions and ensure fairness for every student, regardless of their location.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button 
                                        className="w-full sm:w-auto px-10 py-5 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-2xl shadow-xl shadow-teal-500/20 transition-all transform hover:-translate-y-1"
                                        onClick={() => navigate('/register')}
                                    >
                                        Create Free Account
                                    </button>
                                    <button 
                                        className="w-full sm:w-auto px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 backdrop-blur-md transition-all"
                                        onClick={() => navigate('/aboutUs')}
                                    >
                                        Learn Our Ethics
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}

export default LandingPage;