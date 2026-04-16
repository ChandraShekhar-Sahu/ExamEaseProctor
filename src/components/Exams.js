import React, { useState, useEffect } from 'react';
import { database } from '../services/firebase'; // Import Firebase Database
import { ref, onValue } from 'firebase/database';
// import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; // Import toast library
import Navbar from './header';
import Footer from './footer';
import { useNavigate } from 'react-router-dom';



const Exams = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  // Fetch exams from Firebase Database
useEffect(() => {
  const examsRef = ref(database, "exams");

  onValue(examsRef, (snapshot) => {
    const data = snapshot.val();
    const examsList = [];

    if (data) {
      Object.keys(data).forEach((examTitle) => {
        examsList.push({
          id: examTitle,  // this is your examId
          ...data[examTitle],
        });
      });

      setExams(examsList);
    } else {
      setExams([]);
      console.log("No exams available.");
    }
  });
}, []);





  //pre-exam me jane ke liye

  const handleTakeExamClick = (exam) => {
    if (!isExamAccessible(exam.startTime, exam.endTime)) {
      toast.error(getTimeLeftMessage(exam.startTime) || 'Exam is not yet available.');
      return false;
    }
    
    // Store the intended exam path in localStorage
    localStorage.setItem("examRedirectPath", `/takeexam/${exam.id}`);
    
    // Redirect to exam rules and camera page
    navigate("/pre-exam");
    return true;
  };

  

  // Function to check if the exam is within the allowed time range
  const isExamAccessible = (startTime, endTime) => {
    const now = new Date();
    // console.log(now);
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    // console.log("start: ",start);
    // console.log("end: ", end);
    return now >= start && now <= end;
  };

  // Function to display time left for the exam to start
  const getTimeLeftMessage = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const timeLeft = start - now;
    
    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return `Exam starts in ${hours} hour(s) and ${minutes} minute(s)`;
    }
    return '';
  };

  // const handleTakeExamClick = (startTime, examId) => {
  //   if (!isExamAccessible(startTime, new Date().toISOString())) {
  //     toast.error(getTimeLeftMessage(startTime) || 'Exam is not yet available.');
  //     return false;
  //   }
  //   return true;
  // };

  return (
    <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 min-h-screen ">
      <div className="p-6">
      <Navbar />
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-8 tracking-wide mt-16">Exam Dashboard</h1>
      <Toaster />

      <div className="space-y-8">
        {exams.length > 0 ? (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-blue-500 transition-transform transform hover:scale-105"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800">{exam.title}</h2>
                <span className="text-sm text-gray-500">{new Date(exam.startTime).toLocaleString()}</span>
              </div>

              <p className="text-gray-700 mb-4">{exam.description}</p>
              <p className="text-gray-600"><strong>Start Time:</strong> {new Date(exam.startTime).toLocaleString()}</p>
              <p className="text-gray-600 mb-4"><strong>End Time:</strong> {new Date(exam.endTime).toLocaleString()}</p>
              
              <div className="flex justify-between items-center">
              <button
                  onClick={() => handleTakeExamClick(exam)}
                  className={`py-2 px-6 rounded-lg text-white text-lg font-medium shadow-md transition-all duration-300 ${
                    isExamAccessible(exam.startTime, exam.endTime)
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
              Give Exam
                </button>
                <div className="text-sm text-gray-500">{isExamAccessible(exam.startTime, exam.endTime) ? 'Ready to take' : 'Coming soon'}</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-lg text-gray-500">No exams available.</p>
        )}
      </div>
      </div>
      <div className="mx-2">
      <Footer />
      </div>
     
    </div>
  );
};

export default Exams;
