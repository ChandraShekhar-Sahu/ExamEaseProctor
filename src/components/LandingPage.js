import Navbar from "./header";
import Footer from "./footer";
import React, { useRef } from "react";
import { useNavigate } from 'react-router-dom';

function LandingPage() {

     const navigate = useNavigate();

    const howItWorksRef = useRef(null);  // Reference for the "How It Works" section

    const scrollToHowItWorks = () => {
        howItWorksRef.current?.scrollIntoView({
            behavior: "smooth", // Smooth scroll effect
            block: "start", // Align to the top of the section
        });
    };



    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="pt-12">
            {/* Hero Section */}
            <section className="relative h-[90vh] w-full bg-[url('../assets/images/HeroSection.jpg')] bg-cover bg-center">
                <div className=" absolute inset-0 bg-black bg-opacity-50 flex items-center">
                    <div className="text-white ml-10 max-w-lg">
                        <h1 className="text-4xl md:text-6xl font-bold">
                            Smart Exam Monitoring System
                        </h1>
                        <p className="mt-4 text-lg md:text-xl">
                            Secure, scalable, and efficient proctoring for remote assessments.
                        </p>
                        <div className="mt-6 flex space-x-4">
                            <button 
                                className="px-6 py-3 bg-blue-400 hover:bg-blue-700 text-black font-semibold rounded-lg"
                                onClick={() => navigate('/profile')}
                                >
                                Take a Tour
                            </button>
                            <button 
                            className="px-6 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg"
                            onClick={scrollToHowItWorks}  // Scroll to "How It Works" section
                            >
                                Watch Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            </div>

   {/* Key Features Section */}
<section className="py-16 bg-gradient-to-r from-blue-50 to-gray-100">
    <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-extrabold text-gray-800">Key Features</h2>
        <p className="mt-4 text-lg text-gray-600">
            Unlock the full potential of remote assessments with these features.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {/* Feature 1 */}
            <div className="relative p-8 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-blue-100 text-blue-500 rounded-full">
                    {/* <img src="../assets/images/stock.png" alt="Real-Time Monitoring" className="w-10 h-10" /> */}
                    <div className="w-10 h-10 bg-cover bg-center rounded-full bg-[url('../assets/images/stock.png')]" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">Real-Time Monitoring</h3>
                <p className="mt-4 text-gray-600">
                    AI-powered proctoring ensures integrity and minimizes fraud.
                </p>
            </div>
            {/* Feature 2 */}
            <div className="relative p-8 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-green-100 text-green-500 rounded-full">
                    {/* <img src="../assets/images/dashboard.png" alt="Advanced Analytics" className="w-10 h-10" /> */}
                    <div className="w-10 h-10 bg-cover bg-center rounded-full bg-[url('../assets/images/dashboard.png')]" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">Advanced Analytics</h3>
                <p className="mt-4 text-gray-600">
                    Get detailed reports and insights to assess exam performance.
                </p>
            </div>
            {/* Feature 3 */}
            <div className="relative p-8 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-red-100 text-red-500 rounded-full">
                    {/* <img src="../assets/images/security.png" alt="Secure Exam Interface" className="w-10 h-10" /> */}
                    <div className="w-10 h-10 bg-cover bg-center rounded-full bg-[url('../assets/images/security.png')]" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">Secure Exam Interface</h3>
                <p className="mt-4 text-gray-600">
                    Tamper-proof systems ensure fairness and reliability.
                </p>
            </div>
            {/* Feature 4 */}
            <div className="relative p-8 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-purple-100 text-purple-500 rounded-full">
                    {/* <img src="../assets/images/face-detection.png" alt="Biometric Authentication" className="w-10 h-10" /> */}
                    <div className="w-10 h-10 bg-cover bg-center rounded-full bg-[url('../assets/images/face-detection.png')]" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">Biometric Authentication</h3>
                <p className="mt-4 text-gray-600">
                    Verifies identity through face and fingerprint recognition.
                </p>
            </div>
            {/* Feature 5 */}
            <div className="relative p-8 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-yellow-100 text-yellow-500 rounded-full">
                    {/* <img src="../assets/images/sms.png" alt="Instant Notifications" className="w-10 h-10" /> */}
                    <div className="w-10 h-10 bg-cover bg-center rounded-full bg-[url('../assets/images/sms.png')]" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">Instant Notifications</h3>
                <p className="mt-4 text-gray-600">
                    Alerts for suspicious activities and important updates.
                </p>
            </div>
            {/* Feature 6 */}
            <div className="relative p-8 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-teal-100 text-teal-500 rounded-full">
                    {/* <img src="../assets/images/report.png" alt="Comprehensive Reporting" className="w-10 h-10" /> */}
                    <div className="w-10 h-10 bg-cover bg-center rounded-full bg-[url('../assets/images/report.png')]" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">Comprehensive Reporting</h3>
                <p className="mt-4 text-gray-600">
                    Exportable reports with behavior and performance insights.
                </p>
            </div>
        </div>
    </div>
</section>



           {/* How It Works Section */}
<section 
className="py-16 bg-gradient-to-b from-gray-100 to-blue-50"
 ref={howItWorksRef}  // Attach the ref to this section
 >
    <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center">
            How It Works
        </h2>
        <p className="mt-4 text-lg text-gray-600 text-center">
            A simple, secure, and efficient workflow to conduct exams.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-12">
            {/* Step 1 */}
            <div className="p-6 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-blue-100 text-blue-500 rounded-full">
                    <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">
                    Setup Exam
                </h3>
                <p className="mt-4 text-gray-600">
                    The instructor sets up the exam, questions, and parameters.
                </p>
            </div>
            {/* Step 2 */}
            <div className="p-6 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-green-100 text-green-500 rounded-full">
                    <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">
                    Authenticate
                </h3>
                <p className="mt-4 text-gray-600">
                    Students authenticate using secure biometric or ID methods.
                </p>
            </div>
            {/* Step 3 */}
            <div className="p-6 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-yellow-100 text-yellow-500 rounded-full">
                    <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">
                    Start Exam
                </h3>
                <p className="mt-4 text-gray-600">
                    Students begin the exam in a secure, monitored environment.
                </p>
            </div>
            {/* Step 4 */}
            <div className="p-6 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-red-100 text-red-500 rounded-full">
                    <span className="text-2xl font-bold">4</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">
                    AI Monitoring
                </h3>
                <p className="mt-4 text-gray-600">
                    AI tracks activities, flags suspicious behavior, and ensures integrity.
                </p>
            </div>
            {/* Step 5 */}
            <div className="p-6 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-purple-100 text-purple-500 rounded-full">
                    <span className="text-2xl font-bold">5</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">
                    Submit Exam
                </h3>
                <p className="mt-4 text-gray-600">
                    Students submit their exams securely and receive confirmation.
                </p>
            </div>
            {/* Step 6 */}
            <div className="p-6 bg-white shadow-lg rounded-lg transform transition duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="w-16 h-16 mx-auto flex items-center justify-center bg-teal-100 text-teal-500 rounded-full">
                    <span className="text-2xl font-bold">6</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-gray-800">
                    Analyze Results
                </h3>
                <p className="mt-4 text-gray-600">
                    Instructors access detailed analytics and reports for evaluation.
                </p>
            </div>
        </div>
    </div>
</section>


            <Footer />
        </div>
    );
}

export default LandingPage;
