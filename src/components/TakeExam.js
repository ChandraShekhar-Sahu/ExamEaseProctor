import React, { useState, useEffect, useRef } from 'react';
// import Webcam from 'react-webcam';
import { useParams } from 'react-router-dom';
import { database } from '../services/firebase'; // Import Firebase Database and Storage
import { ref, onValue, update, push, get, set, increment } from 'firebase/database';
import { getAuth } from 'firebase/auth'; // Import Firebase Auth for user details
import FaceUploader from './FaceUploader';
import { useNavigate } from "react-router-dom";



async function fetchDuration(examId) {
  const durationRef = ref(database, `exams/${examId}/duration`);
  try {
    const snapshot = await get(durationRef);
    if (snapshot.exists()) {
      return snapshot.val(); // Duration in minutes
    } else {
      console.error("No duration found for this exam.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching duration:", error);
    return null;
  }
}



const TakeExam = () => {
  const { examId } = useParams();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState(JSON.parse(localStorage.getItem('userAnswers')) || {});
  const [score, setScore] = useState(0);
  const [examEnded, setExamEnded] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const auth = getAuth();
  const [userId, setUserId] = useState(null);
  const [attemptId, setAttemptId] = useState(
  localStorage.getItem(`currentAttempt_${examId}`) || null
);
  // const webcamRef = useRef(null);
  const [proofImages, setProofImages] = useState([]);
  const [cheatingOccurred, setCheatingOccurred] = useState(false);
  const [violations, setViolations] = useState({
  tab_switch: 0,
  headMovement: 0,
  livenessFail: 0,
  faceIssue: 0,
});
const navigate = useNavigate();
const [isSubmitting, setIsSubmitting] = useState(false);
const attemptInitRef = useRef(false);
const endExamRef = useRef(false);
const MAX_VIOLATIONS = 10;
const tabSwitchRef = useRef(false);
const [cameraReady, setCameraReady] = useState(false);

useEffect(() => {
  if (examEnded) return;

  const total = Object.values(violations).reduce((a, b) => a + b, 0);

  if (total >= MAX_VIOLATIONS) {
    alert("Exam auto-submitted due to cheating.");
    handleEndExam();
  }
}, [violations, examEnded]);


// Function to initialize attempt once
const initializeAttempt = async () => {
  if (!userId || attemptId) return attemptId;

  try {
    const attemptRef = push(ref(database, "examAttempts"));
    const newAttemptId = attemptRef.key;

    const attemptData = {
      attemptId: newAttemptId,
      examId: examId,
      examTitle: examData?.title || "",      
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
    updates[`proctoring/${examId}/${userId}/${newAttemptId}/violations`] = {
  tab_switch: 0,
  headMovement: 0,
  livenessFail: 0,
  faceIssue: 0
};

    await update(ref(database), updates);

    localStorage.setItem(`currentAttempt_${examId}`, newAttemptId);
    setAttemptId(newAttemptId);

    return newAttemptId;
  } catch (err) {
    console.error("Failed to initialize attempt:", err);
    return null;
  }
};




  useEffect(() => {

    if (!attemptId) return; // 🚫 Do nothing until attempt exists

  const handleVisibilityChange = () => {
   if (document.visibilityState === "hidden" && !tabSwitchRef.current) {
    console.log("Tab became hidden");
    tabSwitchRef.current = true;
    handleCheating("tab_switch");

     setTimeout(() => {
      tabSwitchRef.current = false;
    }, 3000);

  }
    
  };

  
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [attemptId]);


useEffect(() => {
  const auth = getAuth();
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      setUserId(user.uid);
    }
  });

  return () => unsubscribe();
}, []);

const handleCheating = async (type, image) => {
  if (!attemptId || !userId) 
  {
  console.warn("Violation ignored — attempt not ready");
  return;
}

  setCheatingOccurred(true);


  // 2️⃣ Update Firebase immediately
  await update(
    ref(database, `proctoring/${examId}/${userId}/${attemptId}/violations`),
    {
      [type]: increment(1)
    }
  );

  // 3️⃣ Capture screenshot
   if (image) {
    setProofImages(prev => [
      ...prev,
      { image, type: type }
    ]);
  }
};




// // Handle Webcam Capture (NO UPLOAD HERE)
// useEffect(() => {
//   if (examEnded) return;

//   let capturedPhotos = 0;

//   const capturePhoto = () => {
//     if (webcamRef.current) {
//       const screenshot = webcamRef.current.getScreenshot();

//       if (screenshot) {
//         setProofImages((prev) => [...prev, { image: screenshot, type: "normal" }]);
        
//       }
//     }
//   };

//   const captureInterval = setInterval(() => {
//     if (capturedPhotos >= 5) {
//       clearInterval(captureInterval);
//       return;
//     }

//     capturePhoto();
//     capturedPhotos++;
//   }, 30000); // cleaner 30 sec interval

//   capturePhoto();

//   return () => clearInterval(captureInterval);
// }, [examEnded]);



// Upload Photo to Cloudinary
const uploadPhotoToStorage = async (photo, examId, userId, attemptId) => {
  // console.log("Uploading with:", examId, userId, attemptId);

  try {
    const formData = new FormData();

    formData.append("file", photo); // base64 string
    formData.append("upload_preset", "exam-ease-proctor");
    formData.append("cloud_name", "dknoeudoc");
    formData.append(
                    "folder",
                   `exam_proctoring/${examId}/${userId}/${attemptId}`
                    );


    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dknoeudoc/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    // console.log(data);
    if (!response.ok) {
      throw new Error(data.error?.message || "Image upload failed");
    }

    return data.secure_url; // Cloudinary public URL
  } catch (error) {
    console.error("Error uploading photo:", error);
    return null;
  }
};

useEffect(() => {
  if (!userId || !examData) return;
  if (attemptId) return;
  if (attemptInitRef.current) return;
  
  attemptInitRef.current = true;
  initializeAttempt();
  
}, [userId, examData, attemptId]);




  // Fetch and initialize countdown
  useEffect(() => {
    const initializeCountdown = async () => {
  const duration = await fetchDuration(examId);
  if (!duration) return;

  const storedEndTime = localStorage.getItem(`examEndTime_${examId}`);

  if (storedEndTime) {
    const remaining = Math.floor(
      (parseInt(storedEndTime) - Date.now()) / 1000
    );

    if (remaining > 0) {
      setCountdown(remaining);
    } else {
      setCountdown(0);
    }
  } else {
    const endTime = Date.now() + duration * 60 * 1000;

    localStorage.setItem(`examEndTime_${examId}`, endTime);

    setCountdown(duration * 60);
  }
};

    initializeCountdown();
  }, [examId]);

useEffect(() => {
  if (!attemptId || !userId || !examId) return;

  const violationsRef = ref(
    database,
    `proctoring/${examId}/${userId}/${attemptId}/violations`
  );

  const unsubscribe = onValue(violationsRef, (snapshot) => {
    if (snapshot.exists()) {
      setViolations(snapshot.val());
    }
  });

  return () => unsubscribe();
}, [attemptId, userId, examId]);


  // // Countdown timer logic
  useEffect(() => {

    if (countdown === null) return;

    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleEndExam(); // Auto-submit when time is up
    }
    return () => clearInterval(timer);
  }, [countdown]);

useEffect(() => {
  if (!examId) return;

  const examRef = ref(database, `exams/${examId}`);

    const unsubscribe = onValue(examRef, (snapshot) => {
    if (snapshot.exists()) {
      setExamData(snapshot.val());
    } else {
      setExamData(null);
    }
    setLoading(false);
  });

  return () => unsubscribe();

}, [examId]);


  useEffect(() => {
    localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
  }, [userAnswers]);

  const handleAnswerChange = (questionId, optionIndex) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: optionIndex,
    }));
  };




  const handleClearResponse = (questionId) => {
    setUserAnswers((prevAnswers) => {
      const updatedAnswers = { ...prevAnswers };
      delete updatedAnswers[questionId];
      return updatedAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < Object.keys(examData.questions).length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

   // Add the beforeunload event listener to auto-submit the exam
useEffect(() => {
  const handleBeforeUnload = (event) => {
    if (!examEnded) {
      event.preventDefault();
      event.returnValue = "Exam will be auto-submitted.";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [examEnded]);


  

  // const autoSubmitExam = async () => {
  //   if (!examEnded && examData?.questions) {
  //     let totalScore = 0;
  //     Object.keys(examData.questions).forEach((questionId) => {
  //       const question = examData.questions[questionId];
  //       const userAnswer = userAnswers[questionId];
  //       if (userAnswer !== undefined && question.correctOption === userAnswer) {
  //         totalScore++;
  //       }
  //     });
  //     setScore(totalScore);
  //     setExamEnded(true);
  //     localStorage.removeItem('userAnswers');
  //     localStorage.removeItem(`examEndTime_${examId}`);

  //     const attemptId = await storeUserDetails(totalScore);

  //   if (attemptId) {
  //     await uploadAllSnapshots(attemptId, totalScore);
  //   }
  //   }
  // };


const handleNormalCapture = (image) => {
  setProofImages(prev => [
    ...prev,
    { image, type: "normal" }
  ]);
};



const storeUserDetails = async (totalScore) => {
  if (!userId || !attemptId) return null;

  try {
    await update(ref(database, `examAttempts/${attemptId}`), {
      score: totalScore,
      cheating: cheatingOccurred || Object.values(violations).some(v => v > 0),
    });

    return attemptId;
  } catch (error) {
    console.error("❌ Firebase write error:", error);
    return null;
  }
};


const uploadAllSnapshots = async (attemptId, totalScore) => {
  if (!attemptId) return;

  const uploadedImages = {};

  for (let i = 0; i < proofImages.length; i++) {
    const { image, type } = proofImages[i];
    const url = await uploadPhotoToStorage(image, examId, userId, attemptId);
    if (url) {
      uploadedImages[`img_${i + 1}`] = {
        url,
        type: type || "normal",
        timestamp: new Date().toISOString(),
      };
    }
  }

  await update(ref(database, `proctoring/${examId}/${userId}/${attemptId}`), {
    snapshots: uploadedImages,
  });

  console.log("Snapshots + violations saved.");
};



const handleEndExam = async () => {
  if (endExamRef.current) return;
  if (!attemptId || !examData) return;

  endExamRef.current = true;
  setIsSubmitting(true);

  let totalScore = 0;
  Object.keys(examData.questions).forEach((qid) => {
    if (userAnswers[qid] === examData.questions[qid].correctOption) {
      totalScore++;
    }
  });

  setScore(totalScore);
  setExamEnded(true);

  await update(ref(database, `examAttempts/${attemptId}`), {
    score: totalScore,
    cheating: cheatingOccurred || Object.values(violations).some(v => v > 0),
    endedAt: new Date().toISOString()
  });

  await uploadAllSnapshots(attemptId);

  localStorage.removeItem('userAnswers');
  localStorage.removeItem(`examEndTime_${examId}`);
  localStorage.removeItem(`currentAttempt_${examId}`);

  setExamEnded(true);

setTimeout(() => {
  navigate("/exams");
}, 300);
};


  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return <p className="text-center text-lg">Loading...</p>;
  }

  if (!examData) {
    return <p className="text-center text-lg">No such exam found.</p>;
  }

  const questionIds = Object.keys(examData.questions);
  const currentQuestion = examData.questions[questionIds[currentQuestionIndex]];

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">

      <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl lg:text-3xl font-bold">Exam: {examData?.title}</h1>
        <div className="text-red-500 font-bold text-lg lg:text-xl">
          Time Left: {formatCountdown(countdown)}
        </div>
        <button
          onClick={handleEndExam}
          disabled={isSubmitting}
          className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-lg text-sm lg:text-lg"
        >
        {isSubmitting ? "Submitting...":" End Exam"}
        </button>
      </div>

      </>


      {examEnded ? (
        <div className="text-center text-lg lg:text-2xl">
          <p>Exam ended. Your score: {score} / {questionIds.length}</p>
        </div>
      ) : (
        <div className="bg-white shadow-md p-4 lg:p-8 rounded-lg">
          <h2 className="text-lg lg:text-2xl font-semibold mb-2">
            Question {currentQuestionIndex + 1}: {currentQuestion.questionText}
          </h2>
          <div className="space-y-2">
            {currentQuestion.options.map((option, idx) => (
              <label
                key={idx}
                className="block text-sm lg:text-lg cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={idx}
                  checked={userAnswers[questionIds[currentQuestionIndex]] === idx}
                  onChange={() => handleAnswerChange(questionIds[currentQuestionIndex], idx)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded-lg text-sm lg:text-lg"
            >
              Previous
            </button>
            <button
              onClick={() => handleClearResponse(questionIds[currentQuestionIndex])}
              className="bg-yellow-300 hover:bg-yellow-400 text-black py-1 px-4 rounded-lg text-sm lg:text-lg"
            >
              Clear Response
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === questionIds.length - 1}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded-lg text-sm lg:text-lg"
            >
              Save and Next
            </button>
          </div>
        </div>
      )}

      {!examEnded && (
        <div className="flex flex-wrap justify-center mt-4 space-x-2">
          {questionIds.map((_, index) => (
            <button
              key={index}
              onClick={() => handleJumpToQuestion(index)}
              className={`w-8 h-8 lg:w-12 lg:h-12 rounded-full text-sm lg:text-lg ${
                userAnswers[questionIds[index]] !== undefined
                  ? 'bg-green-400'
                  : 'bg-yellow-200'
              } hover:shadow-md`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}


      <>
      {/* <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" /> */}
      <FaceUploader
      backendUrl="http://127.0.0.1:8000/api/verify_face/" 
      onViolation={handleCheating}
      examEnded={examEnded}
      onNormalCapture={handleNormalCapture}
      />
      {/* <ExamPage /> */}
      </>
    </div>
  );
};



export default TakeExam;