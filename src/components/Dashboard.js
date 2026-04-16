import React, { useState, useEffect } from 'react';
import { auth, database } from '../services/firebase'; // Import Firebase Auth and Database
import { onAuthStateChanged } from 'firebase/auth'; // Firebase Auth listener
import { getDatabase, ref, get, child } from "firebase/database"; // Firebase Database
import Navbar from './header';
import Footer from './footer';

const Dashboard = () => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [activeTab, setActiveTab] = useState('examsCreated'); // Toggle state
  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState([]);
  const [candidates, setCandidates] = useState([]); // State for candidates

  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showCandidatesModal, setShowCandidatesModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);


  // Function to fetch exams created by the user
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
          title: data.title || "Untitled",
          description: data.description,
          endTime: data.endTime,
        };
      })
    );

    return examsData.filter(Boolean);

  } catch (err) {
    console.error(err);
    return [];
  }
};



  // Function to fetch exams taken by the user
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
        score: a.score,
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
      if (activeTab === 'examsCreated') {
        const examsData = await fetchExamsCreatedByUser(userId);
        setExams(examsData);
      } else if (activeTab === 'examsTaken') {
        const examsData = await fetchExamsTakenByUser(userId);
        setExams(examsData);
      } else {
        setExams([]); // Clear exams data for other tabs
      }
    }
  };

  getExams();
}, [userId, activeTab]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Set user ID from Firebase Auth
        setLoading(false);
      } else {
        console.error('No user logged in');
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  // Fetch results from the directory
const fetchResults = async (examId) => {
  try {
    const attemptsRef = ref(database, `examAttempts`);
    const snapshot = await get(attemptsRef);

    if (!snapshot.exists()) {
      setResults([]);
      return;
    }

    const data = snapshot.val();

    const filtered = Object.values(data)
      .filter(a => a.examId === examId && a.userId === userId)
      .map(a => ({
        attempt: a.attemptId,
        timestamp: a.timestamp || "N/A",
        score: a.score || 0,
      }));

    setResults(filtered);

  } catch (error) {
    console.error(error);
  }
};


  const handleViewScores = (examId) => {
    fetchResults(examId);
    setShowModal(true);
  };
  
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
        cheating: a.cheating,
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
  


// Function to show More Details popup
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

  // weighted scoring (not random — intentional)
  const score =
    face * 3 +     // serious
    head * 2 +     // moderate
    live * 3 +     // serious
    tab * 1;       // minor

  if (score >= 10) return { level: "HIGH", color: "text-red-600" };
  if (score >= 5) return { level: "MEDIUM", color: "text-yellow-500" };
  return { level: "LOW", color: "text-green-600" };
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

  if (loading) {
    return <div>Loading...</div>;
  }

  const risk = reportData ? calculateRisk(reportData.violations) : null;

  return (
    <div className="w-full">
      <Navbar />
      {/* Banner Section */}
      <div className="bg-blue-400 text-white pt-20 py-12 flex justify-center items-center flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8">
        <img
          src="https://cdn-icons-png.flaticon.com/128/1164/1164651.png"
          alt="Book"
          className="w-16 h-16 sm:w-24 sm:h-24"
        />
        <img
          src="https://cdn-icons-png.flaticon.com/128/937/937159.png"
          alt="Pen"
          className="w-16 h-16 sm:w-24 sm:h-24"
        />
        <img
          src="https://cdn-icons-png.flaticon.com/128/4269/4269808.png"
          alt="Technology"
          className="w-16 h-16 sm:w-24 sm:h-24"
        />
      </div>

      {/* Toggle Buttons Section */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setActiveTab('examsTaken')}
          className={`w-full py-4 font-semibold rounded-lg shadow-md transition-all ${
            activeTab === 'examsTaken'
              ? 'bg-blue-700 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          Exams Taken
        </button>
        <button
          onClick={() => setActiveTab('examsCreated')}
          className={`w-full py-4 font-semibold rounded-lg shadow-md transition-all ${
            activeTab === 'examsCreated'
              ? 'bg-blue-700 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          Exams Created
        </button>
      </div>

      <div className="mt-6 p-4">
  {activeTab === 'examsCreated' ? (
    <>
      <h1 className="text-xl font-semibold mb-4">Your Created Exams</h1>
      {exams.length > 0 ? (
        <ul>
          {exams.map((exam) => (
            <li key={exam.id} className="mb-4 border-b pb-2">
              <h1 className="font-semibold text-lg">{exam.title}</h1>
              <h3 className="text-gray-600">{exam.description}</h3>
              <p className="text-sm text-gray-500">End Time: {exam.endTime}</p>
              <button
                onClick={() => handleViewCandidates(exam.id)}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg shadow-md mt-2"
              >
                View Candidate
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No exams found.</p>
      )}
    </>
  ) : (
    <>
      <h1 className="text-xl font-semibold mb-4">Exams You've Taken</h1>
      {exams.length > 0 ? (
        <ul>
          {exams.map((exam, index) => (
            <li key={index} className="mb-4 border-b pb-2">
              <h1 className="font-semibold text-lg">Exam Name: {exam.examTitle}</h1>
              <h3 className="text-gray-600">Score: {exam.score}</h3>
              {/* <p className="text-sm text-gray-500">Exam: {exam.examTitle}</p> */}
              <p className="text-sm text-gray-400">Time: {exam.timestamp}</p>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => (window.location.href = '/exams')}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg shadow-md"
                >
                  Reattempt
                </button>
                <button
                  onClick={() => handleViewReport(exam)}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md"
                  >
                    View Proctoring Report
                </button>
              </div>
            </li>
          ))}

        </ul>
      ) : (
        <p>No exams found.</p>
      )}

    </>
  )}
</div>


<div id="candidatesList" className="mt-4"></div>


{showCandidatesModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white w-[600px] p-6 rounded-xl shadow-xl max-h-[80vh] overflow-y-auto">

      <h2 className="text-2xl font-bold mb-4">Candidates</h2>

      {candidates.map((c, i) => (
        <div key={i} className="flex justify-between items-center p-3 border rounded-lg mb-2">
          <div>
            <p className="font-semibold">{c.email}</p>
            <p className="text-sm text-gray-500">Score: {c.score}</p>
          </div>

          <button
            onClick={() => showMoreDetails(c)}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Details
          </button>
        </div>
      ))}

      <button
        onClick={() => setShowCandidatesModal(false)}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}

{showDetailsModal && candidateDetails && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white w-[700px] p-6 rounded-xl shadow-xl max-h-[80vh] overflow-y-auto">

      <h2 className="text-xl font-bold mb-4">Details</h2>

      {/* Violations */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Violations</h3>
        <p>Face: {candidateDetails.violations.faceIssue || 0}</p>
        <p>Head: {candidateDetails.violations.headMovement || 0}</p>
        <p>Liveness: {candidateDetails.violations.livenessFail || 0}</p>
        <p>Tab Switch: {candidateDetails.violations.tab_switch || 0}</p>
      </div>

      {/* Images */}
      <div>
        <h3 className="font-semibold mb-2">Snapshots</h3>
        <div className="grid grid-cols-3 gap-2">
          {candidateDetails.images.map((img, i) => (
            <img key={i} src={img.url} className="rounded w-full h-24 object-cover" />
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowDetailsModal(false)}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}


{showReportModal && reportData && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white w-[700px] p-6 rounded-xl shadow-xl max-h-[80vh] overflow-y-auto">

      <h2 className="text-xl font-bold mb-4">Proctoring Report</h2>

      <div className="mb-4 p-4 rounded-lg bg-gray-100">
        <h3 className="text-lg font-bold">
          Risk Level: <span className={`px-3 py-1 rounded-full text-white ${risk.level === "HIGH"
                  ? "bg-red-500"
                  : risk.level === "MEDIUM"
                  ? "bg-yellow-500"
                  : "bg-green-500"
                }`}>
  {risk.level}
</span>
        </h3>
      </div>

      {/* Violations */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Violations</h3>
        <p>Face Issues: {reportData.violations.faceIssue || 0}</p>
        <p>Head Movement: {reportData.violations.headMovement || 0}</p>
        <p>Liveness Fails: {reportData.violations.livenessFails || 0}</p>
        <p>Tab Switch: {reportData.violations.tab_switch || 0}</p>
      </div>

      {/* Images */}
      <div>
        <h3 className="font-semibold mb-2">Snapshots</h3>
        <div className="grid grid-cols-3 gap-2">
          {reportData.images.length > 0 ? (
            reportData.images.map((img, i) => (
              <img
                key={i}
                src={img.url}
                className="rounded w-full h-24 object-cover"
              />
            ))
          ) : (
            <p>No snapshots available</p>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowReportModal(false)}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}

       <Footer /> 
    </div>
  );
};



export default Dashboard;
