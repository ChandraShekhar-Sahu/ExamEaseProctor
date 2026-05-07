import React from "react";
import Navbar from "./header";
import Footer from "./footer";

// ==========================================
// IMAGE SETUP
// Currently using high-quality placeholders so Webpack doesn't crash.
// To use your local images, uncomment the 3 lines below and change the variables!
// ==========================================
// import localCommunityImg from '../assets/images/community.jpg';
// import localEffortImg from '../assets/images/effort.jpg';
// import localInnovationImg from '../assets/images/innovation.jpg';

const communityImg = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80";
const effortImg = "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80";
const innovationImg = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80";


function AboutUs() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-teal-100 selection:text-teal-900 flex flex-col">
      <Navbar />

      {/* --- 1. HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-96 bg-teal-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-extrabold uppercase tracking-widest mb-6 border border-teal-100">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            ExamEase Proctor
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
            Securing the Integrity of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-500">
              Digital Education
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
            We combine technology, innovation, and ethics to create a seamless, secure, and inclusive online examination environment.
          </p>
        </div>
      </section>

      {/* --- 2. COMMUNITY WORK CULTURE --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Image Left */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-cyan-400 rounded-3xl transform -rotate-3 scale-105 opacity-20 blur-lg"></div>
              <div 
                className="relative w-full h-[400px] bg-slate-200 bg-cover bg-center rounded-3xl shadow-xl border-4 border-white overflow-hidden"
                style={{ backgroundImage: `url('${communityImg}')` }}
              >
                <div className="absolute inset-0 bg-slate-900/10"></div>
              </div>
            </div>

            {/* Text Right */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Our Community Work Culture</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                At ExamEase Proctor, our core values of <strong className="text-teal-600">collaboration</strong>, <strong className="text-teal-600">innovation</strong>, and <strong className="text-teal-600">commitment</strong> drive everything we do. We believe in empowering educators and students alike through a culture that fosters:
              </p>
              
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0"><span className="w-2 h-2 rounded-full bg-teal-600"></span></div>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Inclusivity</strong>
                    <span className="text-slate-600 text-sm">Designing tools that cater to diverse needs.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0"><span className="w-2 h-2 rounded-full bg-teal-600"></span></div>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Transparency</strong>
                    <span className="text-slate-600 text-sm">Open communication within our team ensures ideas are heard.</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0"><span className="w-2 h-2 rounded-full bg-teal-600"></span></div>
                  <div>
                    <strong className="text-slate-900 block mb-0.5">Continuous Learning</strong>
                    <span className="text-slate-600 text-sm">Staying updated with cutting-edge technologies.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- 3. METHODOLOGY / TECH STACK --- */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">Our Methodology</h2>
            <p className="mt-4 text-slate-500 font-medium max-w-2xl mx-auto">
              We follow a structured, phased approach utilizing a modern tech stack to ensure the highest standards of functionality and security.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1 bg-white">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-emerald-400 font-black text-xl">Dj</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">Django</h4>
              <p className="text-xs text-slate-500 font-medium">Backend & AI Models</p>
            </div>
            
            <div className="border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1 bg-white">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-sky-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"/><path d="M12 16.75C9.38 16.75 7.25 14.62 7.25 12C7.25 9.38 9.38 7.25 12 7.25C14.62 7.25 16.75 9.38 16.75 12C16.75 14.62 14.62 16.75 12 16.75ZM12 8.75C10.21 8.75 8.75 10.21 8.75 12C8.75 13.79 10.21 15.25 12 15.25C13.79 15.25 15.25 13.79 15.25 12C15.25 10.21 13.79 8.75 12 8.75Z"/></svg>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">React JS</h4>
              <p className="text-xs text-slate-500 font-medium">Dynamic Candidate UI</p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1 bg-white">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M11.644 1.408a1.25 1.25 0 011.696.868l1.378 4.756 4.756 1.378a1.25 1.25 0 01.442 2.148l-3.666 3.12 1.106 4.856a1.25 1.25 0 01-1.854 1.346l-4.15-2.522-4.15 2.522a1.25 1.25 0 01-1.854-1.346l1.106-4.856-3.666-3.12a1.25 1.25 0 01.442-2.148l4.756-1.378 1.378-4.756a1.25 1.25 0 011.282-.868z"/></svg>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">Firebase</h4>
              <p className="text-xs text-slate-500 font-medium">Real-time Data & Auth</p>
            </div>

            <div className="border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1 bg-white">
              <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-cyan-400 font-black text-2xl">~</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-1">Tailwind CSS</h4>
              <p className="text-xs text-slate-500 font-medium">Responsive Enterprise UI</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 4. OUR EFFORTS --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Left */}
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Our Efforts</h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Creating the ExamEase Proctor system was a labor of love and dedication by a diverse team of developers, designers, and domain experts. From brainstorming sessions to late-night debugging, every step was driven by our vision of transforming online examinations.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0"><svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>
                  <span className="text-slate-600 font-medium">Understanding the complex challenges of online proctoring.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0"><svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>
                  <span className="text-slate-600 font-medium">Developing cutting-edge AI models for live monitoring.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0"><svg className="w-3 h-3 text-teal-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg></div>
                  <span className="text-slate-600 font-medium">Testing rigorously to eliminate vulnerabilities and ensure trust.</span>
                </li>
              </ul>
              <p className="mt-6 text-slate-600 italic">
                "We are proud to bring this innovative solution to life and look forward to empowering educators and students worldwide."
              </p>
            </div>

            {/* Image Right */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-cyan-400 rounded-3xl transform rotate-3 scale-105 opacity-20 blur-lg"></div>
              <div 
                className="relative w-full h-[400px] bg-slate-200 bg-cover bg-center rounded-3xl shadow-xl border-4 border-white overflow-hidden"
                style={{ backgroundImage: `url('${effortImg}')` }}
              >
                <div className="absolute inset-0 bg-slate-900/10"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- 5. INNOVATION / CTA BANNER --- */}
      <section className="relative py-32 mt-auto border-t border-slate-200 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${innovationImg}')` }}
        ></div>
        {/* Dark overlay to make text readable */}
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
            Empowering Education Through Technology
          </h2>
          <p className="text-lg text-slate-300 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Our mission is to bridge the gap between traditional examination methods and the future of digital assessment with integrity, security, and ease.
          </p>
          <a href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold transition-colors shadow-lg shadow-teal-500/25">
            Start Proctoring Today
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutUs;