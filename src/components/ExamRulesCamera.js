import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const ExamRulesCamera = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing the camera:", error);
      }
    };
    startCamera();
  }, []);

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/png");  // Base64
    setPhoto(imageData);
  };

  const sendPhotoToBackend = async () => {
    if (!photo) return;
    setLoading(true);

    // Convert Base64 to Blob
    const blob = await fetch(photo).then(res => res.blob());
    const formData = new FormData();
    formData.append("image", blob, "captured_photo.png");

    try {
        const response = await fetch("http://127.0.0.1:8000/api/upload_photo/", {
            method: "POST",
            body: formData,
            headers: {
                // Do NOT set Content-Type, let the browser handle it
            },
        });

        if (response.ok) {
            console.log("Photo uploaded successfully!");
            handleContinue();
        } else {
            const errorData = await response.json();
            console.error("Failed to upload photo:", errorData);
        }
    } catch (error) {
        console.error("Error uploading photo:", error);
    } finally {
        setLoading(false);
    }
};


  const handleContinue = () => {
    const examPath = localStorage.getItem("examRedirectPath");
    console.log(examPath);
    if (examPath) {
      navigate(examPath);
      localStorage.removeItem("examRedirectPath");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 p-6">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-4xl w-full flex">
        {/* Left Section - Exam Rules */}
        <div className="w-1/2 pr-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">📜 Online Exam Rules</h2>
          <p className="text-gray-600 mb-4">
            Before starting the exam, please read and follow these rules carefully:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>🚫 No switching tabs or browsers.</li>
            <li>📷 Keep your face visible at all times.</li>
            <li>🔇 No external help (books, notes, or devices).</li>
            <li>🎧 Remove any earphones or headphones.</li>
            <li>⏳ Ensure a stable internet connection.</li>
            <li>🛑 Any violation will result in disqualification.</li>
          </ul>
        </div>

        {/* Right Section - Camera Capture */}
        <div className="w-1/2 flex flex-col items-center">
          <div className="bg-gray-900 p-4 rounded-lg w-full flex justify-center">
            <video ref={videoRef} autoPlay className="w-64 h-48 rounded-lg shadow-lg bg-black"></video>
            <canvas ref={canvasRef} className="hidden" width="320" height="240"></canvas>
          </div>
          <div className="mt-4 space-x-4">
            <button
              onClick={takePhoto}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition"
            >
              📸 Take Photo
            </button>
          </div>

          {/* Show Captured Photo */}
          {photo && (
            <div className="mt-6 text-center">
              <img src={photo} alt="Captured" className="w-32 h-24 border rounded-md shadow-lg" />
              <div className="mt-4 space-x-4">
                <button
                  onClick={() => setPhoto(null)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md transition"
                >
                  🔄 Retake
                </button>
                <button
                  onClick={sendPhotoToBackend}
                  className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={loading}
                >
                  {loading ? "⏳ Uploading..." : "✅ Continue"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamRulesCamera;
