import React, { useState, useEffect } from 'react';
import { auth, storage } from '../services/firebase'; // Firebase imports
import { getDatabase, ref, get, set } from 'firebase/database'; // Realtime Database methods
import { uploadBytesResumable, getDownloadURL, ref as storageRef } from 'firebase/storage'; // Corrected import
import { toast } from 'react-toastify'; // For showing toast notifications
import { onAuthStateChanged } from 'firebase/auth'; // Auth listener
import Navbar from './header';

function Profile() {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    dob: '',
    gender: '',
    country: '',
    pincode: '',
    state: '',
    city: '',
    profession: '',
    qualification: '',
    yearOfGraduation: '',
    abcId: '',
    localChapterState: '',
    collegeName: '',
    universityName: '',
    rollNo: '',
    degree: '',
    department: '',
    studyYear: '',
    companyURL: '',
    photoURL: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        fetchUserData(currentUser);
      } else {
        toast.error("User is not logged in.");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (currentUser) => {
    const sessionKey = localStorage.getItem("sessionKey");
    if (!sessionKey) {
      toast.error("Session expired or not found.");
      setLoading(false);
      return;
    }

    try {
      const db = getDatabase();
      const userRef = ref(db, "Users/" + currentUser.uid);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        if (userData.sessionKey === sessionKey) {
          setUser({
            ...userData, // Assuming all fields are already saved in the DB
            name: userData.firstName + ' ' + userData.lastName || currentUser.displayName || '',
            photoURL: userData.photoURL || currentUser.photoURL || '',
          });
        } else {
          toast.error("Session key mismatch. Please log in again.");
        }
      } else {
        toast.error("User data not found in Realtime Database.");
      }
    } catch (error) {
      toast.error("Failed to fetch user data.");
      console.error("Error fetching user data: ", error);
    }
    setLoading(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error("User not logged in.");
      return;
    }

    const photoStorageRef = storageRef(storage, `profileImages/${userId}`);
    const uploadTask = uploadBytesResumable(photoStorageRef, file);

    setIsUploading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        toast.error("Upload error: " + error.message);
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
          const db = getDatabase();
          const userRef = ref(db, "Users/" + userId);
          await set(userRef, { photoURL: url }, { merge: true });
          setUser((prev) => ({ ...prev, photoURL: url }));
          toast.success("Profile image uploaded successfully.");
          setIsUploading(false);
          setUploadProgress(0);
        });
      }
    );
  };

  const handleProfileUpdate = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error("User not logged in.");
      return;
    }

    try {
      const db = getDatabase();
      const userRef = ref(db, "Users/" + userId);
      await set(userRef, user, { merge: true });
      toast.success("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error("Error updating profile: ", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative w-full h-screen">
      <Navbar />
      <div className="mt-18 bg-cover h-[80vh] bg-center relative bg-[url('../assets/images/profile_bg.jpg')]">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40">
          <div className="relative">
            <img
              src={user.photoURL || 'https://cdn.vectorstock.com/i/500p/53/42/user-member-avatar-face-profile-icon-vector-22965342.jpg'}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
            />
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handlePhotoUpload}
            />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-white">{user.name || 'No Name Available'}</h1>
          <p className="text-gray-200">{user.email}</p>
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-semibold text-gray-800">Account Info</h2>
  <div className="flex justify-end">
  <button
    onClick={isEditing ? handleProfileUpdate : () => setIsEditing(true)}
    className="bg-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all hover:bg-blue-500 "
  >
    <img 
      src="https://cdn-icons-png.freepik.com/256/4518/4518158.png?semt=ais_hybrid" 
      alt="Edit Profile" 
      className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11" 
    />
  </button>
</div>

</div>


  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {[
      { label: "First Name", value: user.firstName, field: "firstName" },
      { label: "Last Name", value: user.lastName, field: "lastName" },
      { label: "Mobile Number", value: user.mobileNumber, field: "mobileNumber" },
      { label: "Email", value: user.email, field: "email", disabled: true },
      { label: "Date of Birth", value: user.dob, field: "dob" },
      { label: "Gender", value: user.gender, field: "gender", type: "select" },
      { label: "Country Residing In", value: user.country, field: "country" },
      { label: "Pincode", value: user.pincode, field: "pincode" },
      { label: "State", value: user.state, field: "state" },
      { label: "City/District", value: user.city, field: "city" },
      { label: "Profession", value: user.profession, field: "profession" },
      { label: "Highest Qualification", value: user.qualification, field: "qualification" },
      { label: "Year of Graduation", value: user.yearOfGraduation, field: "yearOfGraduation" },
      { label: "ABC ID", value: user.abcId, field: "abcId" },
      { label: "Local Chapter State", value: user.localChapterState, field: "localChapterState" },
      { label: "College Name", value: user.collegeName, field: "collegeName" },
      { label: "University Name", value: user.universityName, field: "universityName" },
      { label: "College/School Roll No.", value: user.rollNo, field: "rollNo" },
      { label: "Degree", value: user.degree, field: "degree" },
      { label: "Department", value: user.department, field: "department" },
      { label: "Study Year", value: user.studyYear, field: "studyYear" },
      { label: "Company URL", value: user.companyURL, field: "companyURL" },
    ].map((item, index) => (
      <div key={index} className="flex flex-col">
        <label className="text-gray-700 text-sm font-semibold">{item.label} *</label>
        {item.type === "select" ? (
          <select
            value={item.value}
            onChange={(e) => setUser({ ...user, [item.field]: e.target.value })}
            disabled={!isEditing}
            className="w-full p-3 mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        ) : (
          <input
            type={item.type || "text"}
            value={item.value}
            onChange={(e) => setUser({ ...user, [item.field]: e.target.value })}
            disabled={!isEditing}
            className="w-full p-3 mt-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}
      </div>
    ))}
   
  </div>
</div>

    </div>
  );
}

export default Profile;
