import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase'; 
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
  
  // NEW: State for our elegant Tab system
  const [activeTab, setActiveTab] = useState('personal');

  const CLOUDINARY_UPLOAD_PRESET = "exam-ease-proctor"; 

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
        { method: "POST", body: formData }
      );
      const data = await response.json();

      if (data.secure_url) {
        const db = getDatabase();
        const userRef = ref(db, "Users/" + userId);
        await set(userRef, { ...user, photoURL: data.secure_url });
        setUser((prev) => ({ ...prev, photoURL: data.secure_url }));
        toast.success("Profile image updated!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast.error("Upload error: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const db = getDatabase();
      const userRef = ref(db, "Users/" + userId);
      await set(userRef, user, { merge: true });
      toast.success("Profile updated successfully.");
      setOriginalUser(user); 
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setUser(originalUser); 
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // --- DATA STRUCTURES ---
  const tabData = {
    personal: [
      { label: "First Name", field: "firstName", type: "text" },
      { label: "Last Name", field: "lastName", type: "text" },
      { label: "Email Address", field: "email", type: "email", disabled: true },
      { label: "Mobile Number", field: "mobileNumber", type: "tel" },
      { label: "Date of Birth", field: "dob", type: "date" },
      { label: "Gender", field: "gender", type: "select", options: ["Male", "Female", "Other"] },
    ],
    location: [
      { label: "Country", field: "country", type: "text" },
      { label: "State", field: "state", type: "text" },
      { label: "City/District", field: "city", type: "text" },
      { label: "Pincode", field: "pincode", type: "text" },
    ],
    academic: [
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
      { label: "Portfolio / URL", field: "companyURL", type: "url" },
    ]
  };

  // --- SMART FIELD RENDERER (Read vs Edit Mode) ---
  const renderField = (item) => (
    <div key={item.field} className="flex flex-col group">
      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
        {item.label}
        {isEditing && !item.disabled && <span className="text-indigo-400">*</span>}
      </label>
      
      {!isEditing ? (
        // READ MODE: Beautiful, clean text display
        <div className="py-2 border-b border-slate-100 group-hover:border-slate-200 transition-colors">
          <p className={`text-sm font-semibold ${user[item.field] ? 'text-slate-800' : 'text-slate-300 italic'}`}>
            {user[item.field] || 'Not provided'}
          </p>
        </div>
      ) : (
        // EDIT MODE: Clean input fields
        item.type === "select" ? (
          <select
            value={user[item.field] || ""}
            onChange={(e) => setUser({ ...user, [item.field]: e.target.value })}
            disabled={item.disabled}
            className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
          >
            <option value="" disabled>Select {item.label}</option>
            {item.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
            type={item.type}
            value={user[item.field] || ""}
            onChange={(e) => setUser({ ...user, [item.field]: e.target.value })}
            disabled={item.disabled}
            placeholder={`Enter ${item.label.toLowerCase()}`}
            className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-400"
          />
        )
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <Navbar />
      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />

      {/* --- SLIM, SOFT GEOMETRIC BANNER --- */}
      <div className="h-48 w-full relative overflow-hidden bg-white border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:2rem_2rem]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-indigo-400 opacity-20 blur-[100px]"></div>
      </div>

      {/* --- MAIN COMPACT LAYOUT --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR: Avatar & Controls */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center">
              
              {/* Avatar */}
              <div className="relative group -mt-16 mb-4">
                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100 rotate-3 transition-transform duration-300 group-hover:rotate-0">
                  <img
                    src={user.photoURL || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'}
                    alt="Profile"
                    className={`w-full h-full object-cover ${isUploading ? 'opacity-40 grayscale' : ''}`}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  )}
                  {/* Edit Photo Button */}
                  {!isUploading && (
                    <label className="absolute bottom-1 right-1 bg-white p-1.5 rounded-lg shadow-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100 hover:bg-slate-50">
                      <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  )}
                </div>
              </div>

              {/* User Identity */}
              <h1 className="text-xl font-bold text-slate-900 mb-1">{user.name || 'User Profile'}</h1>
              <p className="text-sm text-slate-500 font-medium mb-6">{user.email}</p>

              {/* Action Buttons */}
              <div className="w-full pt-6 border-t border-slate-100">
                {isEditing ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleProfileUpdate}
                      className="w-full py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all text-sm"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="w-full py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile Details
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT: Tabs & Data */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px] flex flex-col">
              
              {/* Custom Tab Navigation */}
              <div className="flex border-b border-slate-100 bg-slate-50/50">
                {[
                  { id: 'personal', name: 'Personal Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { id: 'location', name: 'Location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                  { id: 'academic', name: 'Academic', icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all relative ${
                      activeTab === tab.id ? 'text-indigo-600 bg-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                    </svg>
                    {tab.name}
                    {/* Active Tab Indicator */}
                    {activeTab === tab.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Dynamic Field Rendering */}
              <div className="p-8 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {tabData[activeTab].map(renderField)}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;