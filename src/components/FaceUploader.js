import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import Webcam from "react-webcam";


const FaceUploader = forwardRef(({ backendUrl, onViolation, examEnded, onNormalCapture},ref) => {
  const webcamRef = useRef(null);
  const [status, setStatus] = useState("Initializing...");
  const [livenessStatus, setLivenessStatus] = useState(null);
  const [headMovementStatus, setHeadMovementStatus] = useState(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);
  const previousFrameRef = useRef(null);
  
  const normalImageCount = useRef(
    parseInt(localStorage.getItem("normal_image_count") || "0", 10)
  );
  const MAX_NORMAL_IMAGES = 4;
  const isUploading = useRef(false);
  const isCameraReady = useRef(false);

  // 🔴 FIX 1: STALE CLOSURE FIX
  // This ensures the interval always uses the most up-to-date attemptId and userId from TakeExam.
  const latestProps = useRef({ onViolation, onNormalCapture });
  useEffect(() => {
    latestProps.current = { onViolation, onNormalCapture };
  }, [onViolation, onNormalCapture]);

useImperativeHandle(ref, () => ({
    captureInstant: () => {
      if (webcamRef.current) return webcamRef.current.getScreenshot();
      return null;
    }
  }));


 useEffect(() => {
  if (examEnded) {
    clearInterval(intervalRef.current);
    return;
  }

// Capture every 9 seconds
    intervalRef.current = setInterval(captureAndUpload, 9000);

  return () => clearInterval(intervalRef.current);
}, [examEnded]);


const handleUserMedia = (stream) => {
    console.log("✅ Camera is officially ready.");
    isCameraReady.current = true; // Update ref immediately
    streamRef.current = stream;
    setStatus("Camera Active");
  };

useEffect(() => {
  if (examEnded && streamRef.current) {
    streamRef.current.getTracks().forEach(track => track.stop());
  }
}, [examEnded]);

useEffect(() => {
  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };
}, []);

const getFrameDifference = (img1, img2) => {
  if (!img1 || !img2) return 1;

  let diffCount = 0;
  const len = Math.min(img1.length, img2.length);

  for (let i = 0; i < len; i += 100) { 
    if (img1[i] !== img2[i]) diffCount++;
  }

  return diffCount / (len / 100);
};

const captureAndUpload = async () => {
// 1. Safety Check: Is camera theoretically ready?
if (!isCameraReady.current) {
      console.log("⏳ Waiting for camera...");
      return;
    }


    if (isUploading.current) return;


    // 2. Hardware Check: Is the video actually playing data?
    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
        console.log("⏳ Video stream not fully loaded yet.");
        return;
    }

 
  const imageSrc = webcamRef.current.getScreenshot();

// 3. SIZE CHECK: If image is too small (blank frame), skip it.
    // A black 320x240 image is ~1.6k chars. A real image is >20k.
    if (!imageSrc || imageSrc.length < 1000) {
      console.log(`⚠️ Skipped blank frame (Size: ${imageSrc?.length || 0})`);
      return;
    }

  // Skip if frame is almost identical
if (previousFrameRef.current) {
  const diff = getFrameDifference(previousFrameRef.current, imageSrc);

  if (diff < 0.02) {
    console.log("Frame unchanged — skipping API call");
    return;
  }
}

previousFrameRef.current = imageSrc;

  isUploading.current = true;

// Valid image -> Convert and Upload
    const file = dataURLtoFile(imageSrc, "face_capture.jpg");
    await verifyFaceMatch(file, imageSrc);

  isUploading.current = false;
};




  const verifyFaceMatch = async (file, screenshot) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(backendUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      console.log("API Response:", result);

        // const screenshot = webcamRef.current.getScreenshot();
      // Use the latest props!
      const triggerViolation = latestProps.current.onViolation;
      const triggerNormal = latestProps.current.onNormalCapture;

//Face not found starting
if(result.face_detected === false)
{
  setStatus("⚠️ No face detected!")
  if (triggerViolation) triggerViolation("faceIssue", screenshot);
}

// FACE MISMATCH
else if (result.match === false) {
  setStatus("⚠️ Face Not Matched!");
  if (triggerViolation) triggerViolation("faceIssue", screenshot);
}


// NORMAL CASE
else {
  setStatus("✅ Face Matched");
  if (normalImageCount.current < MAX_NORMAL_IMAGES) {
    if (triggerNormal) {
            triggerNormal(screenshot);
            normalImageCount.current++;
            localStorage.setItem("normal_image_count", normalImageCount.current);
          }
  }
}



// LIVENESS (Pass null so no image is saved)
   if (result.liveness === true) {
        setLivenessStatus("✅ Liveness confirmed");
      } else {
        setLivenessStatus(`⚠️ ${result.liveness_text || "Liveness check failed"}`);
        if (triggerViolation) triggerViolation("livenessFail", null); 
      }

      // TRIGGER HEAD MOVEMENT VIOLATION (Pass screenshot to save image)
      if (result.head_movement === "normal") {
        setHeadMovementStatus("✅ Head movement normal");
      } else {
        setHeadMovementStatus("⚠️ Suspicious head movement");
        if (triggerViolation) triggerViolation("headMovement", screenshot); 
      }

    } catch (error) {
      console.error("Face match error:", error);
      setStatus("⚠️ Upload failed! Check console.");
    }
  };

  const dataURLtoFile = (dataUrl, filename) => {
    try{
    let arr = dataUrl.split(",");
    let mime = arr[0].match(/:(.*?);/)[1];
    let bstr = atob(arr[1]);
    let n = bstr.length;
    let u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }catch(e){return null;}
  };

  return (
    <div>
      <Webcam
 ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        screenshotQuality={1} 
        width={320}
        height={240}
        videoConstraints={{
          width: 320,
          height: 240,
          facingMode: "user"
        }}
        onUserMedia={handleUserMedia}
       style={{ 
            opacity: 0, 
            position: "fixed", 
            zIndex: -1, 
            top: 0, 
            left: 0 
        }}
      />

      <p className={`text-center text-lg mt-2 ${status.includes("⚠️") ? "text-red-600" : "text-green-600"}`}>
        {status}
      </p>

      {livenessStatus && (
        <p className={`text-center text-sm ${livenessStatus.includes("⚠️") ? "text-yellow-500" : "text-green-500"}`}>
          {livenessStatus}
        </p>
      )}

      {headMovementStatus && (
        <p className={`text-center text-sm ${headMovementStatus.includes("⚠️") ? "text-yellow-500" : "text-green-500"}`}>
          {headMovementStatus}
        </p>
      )}
    </div>
  );
});

export default FaceUploader;
