import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; 
import { getDatabase, ref, get, set } from 'firebase/database'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { onAuthStateChanged } from 'firebase/auth'; 
import Navbar from './header';

function Profile() {
  const [user, setUser] = useState({
    firstName: '', lastName: '', email: '', mobileNumber: '',
    dob: '', gender: '', country: '', pincode: '', state: '', city: '',
    profession: '', qualification: '', yearOfGraduation: '', abcId: '',
    localChapterState: '', collegeName: '', universityName: '',
    rollNo: '', degree: '', department: '', studyYear: '', companyURL: '',
    photoURL: '', name: ''
  });

  const [originalUser, setOriginalUser] = useState({}); 
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // --- REPLACE WITH YOUR CLOUDINARY UNNAMED UPLOAD PRESET ---
  const CLOUDINARY_UPLOAD_PRESET = "exam-ease-proctor"; // Change this to your preset name!

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
          const formattedUser = {
            ...userData,
            name: (userData.firstName + ' ' + userData.lastName).trim() || currentUser.displayName || '',
            photoURL: userData.photoURL || currentUser.photoURL || '',
          };
          setUser(formattedUser);
          setOriginalUser(formattedUser); 
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

  // --- UPDATED CLOUDINARY UPLOAD LOGIC ---
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const userId = auth.currentUser?.uid;
    if (!userId) {
      toast.error("User not logged in.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET); 
  

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dknoeudoc/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        // Save the Cloudinary link to Firebase Realtime Database
        const db = getDatabase();
        const userRef = ref(db, "Users/" + userId);
        
        // Update Firebase
        await set(userRef, { ...user, photoURL: data.secure_url });
        
        // Update local state
        setUser((prev) => ({ ...prev, photoURL: data.secure_url }));
        toast.success("Profile image uploaded to Cloudinary!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error("Cloudinary upload error: " + error.message);
    } finally {
      setIsUploading(false);
    }
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
      setOriginalUser(user); 
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile.");
      console.error("Error updating profile: ", error);
    }
  };

  const handleCancel = () => {
    setUser(originalUser); 
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // (The rest of your personalFields, locationFields, academicFields, and renderField functions remain exactly the same)
  const personalFields = [
    { label: "First Name", field: "firstName", type: "text" },
    { label: "Last Name", field: "lastName", type: "text" },
    { label: "Email Address", field: "email", type: "email", disabled: true },
    { label: "Mobile Number", field: "mobileNumber", type: "tel" },
    { label: "Date of Birth", field: "dob", type: "date" },
    { label: "Gender", field: "gender", type: "select", options: ["Male", "Female", "Other"] },
  ];

  const locationFields = [
    { label: "Country", field: "country", type: "text" },
    { label: "State", field: "state", type: "text" },
    { label: "City/District", field: "city", type: "text" },
    { label: "Pincode", field: "pincode", type: "text" },
  ];

  const academicFields = [
    { label: "Highest Qualification", field: "qualification", type: "text" },
    { label: "Profession", field: "profession", type: "text" },
    { label: "Year of Graduation", field: "yearOfGraduation", type: "number" },
    { label: "Degree", field: "degree", type: "text" },
    { label: "Department", field: "department", type: "text" },
    { label: "Study Year", field: "studyYear", type: "text" },
    { label: "College Name", field: "collegeName", type: "text" },
    { label: "University Name", field: "universityName", type: "text" },
    { label: "College Roll No.", field: "rollNo", type: "text" },
    { label: "ABC ID", field: "abcId", type: "text" },
    { label: "Local Chapter State", field: "localChapterState", type: "text" },
    { label: "Company/Portfolio URL", field: "companyURL", type: "url" },
  ];

  const renderField = (item) => (
    <div key={item.field} className="flex flex-col">
      <label className="text-slate-600 text-xs font-bold uppercase tracking-wider mb-1">
        {item.label} {item.disabled ? "" : <span className="text-rose-500">*</span>}
      </label>
      {item.type === "select" ? (
        <select
          value={user[item.field] || ""}
          onChange={(e) => setUser({ ...user, [item.field]: e.target.value })}
          disabled={!isEditing || item.disabled}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 transition-all shadow-sm"
        >
          <option value="" disabled>Select {item.label}</option>
          {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={item.type}
          value={user[item.field] || ""}
          onChange={(e) => setUser({ ...user, [item.field]: e.target.value })}
          disabled={!isEditing || item.disabled}
          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 transition-all shadow-sm"
          placeholder={`Enter ${item.label}`}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      <Navbar />
      <ToastContainer position="top-center" />

      {/* Header UI remains exactly the same as the previous redesign */}
      <div className="bg-gradient-to-r from-indigo-800 via-purple-700 to-indigo-900 pt-24 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-72 h-72 rounded-full bg-cyan-400 blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white relative">
              <img
                src={user.photoURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                alt="Profile"
                className={`w-full h-full object-cover transition-opacity duration-300 ${isUploading ? 'opacity-50' : ''}`}
              />
              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                  <span className="text-white text-xs font-bold">Uploading...</span>
                </div>
              )}
              {!isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              onChange={handlePhotoUpload}
              disabled={isUploading}
            />
          </div>

          <div className="mb-4 md:mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              {user.name || 'Complete Your Profile'}
            </h1>
            <p className="text-indigo-200 text-lg flex items-center justify-center md:justify-start gap-2 mt-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form UI remains exactly the same */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Account Details</h2>
            <p className="text-slate-500 text-sm">Manage your personal and academic information.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {isEditing ? (
              <>
                <button onClick={handleCancel} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={handleProfileUpdate} className="flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md transition-all flex items-center justify-center gap-2">Save Changes</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="w-full md:w-auto px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all flex items-center justify-center gap-2">Edit Profile</button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{personalFields.map(renderField)}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-800">Location Details</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">{locationFields.map(renderField)}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-800">Academic & Professional</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{academicFields.map(renderField)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;