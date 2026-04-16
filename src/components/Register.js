import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { auth, database } from "../services/firebase";
import { ref, set } from "firebase/database";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const navigate = useNavigate();
  const createdAt = new Date().toISOString();


  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Register user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Generate a unique session key
      const sessionKey = uuidv4();

      // Log session key to console for debugging
      console.log("Session Key:", sessionKey);

      // Create a reference to the user's data in Realtime Database
      const userRef = ref(database, `Users/${user.uid}`);

      // Store user data along with session key in Firebase Realtime Database
      await set(userRef, {
        email: user.email,
        firstName: fname,
        lastName: lname,
        role:"User",
        createdAt: createdAt,
        sessionKey: sessionKey,
        exams: [], // Initialize with an empty array for exams
      });

      // Store session key in localStorage for persistence
      localStorage.setItem("sessionKey", sessionKey);

      // Log session key to verify it's correctly stored in localStorage
      console.log("Stored sessionKey in localStorage:", localStorage.getItem("sessionKey"));

      // Show success message
      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });

      // Redirect to the profile page after registration
      navigate("/profile");
    } catch (error) {
      // Handle registration errors
      console.error("Registration Error:", error.message);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <div className="min-h-screen bg-blue-100 py-6 flex flex-col justify-center sm:py-12">
        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
          <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
            <div className="max-w-md mx-auto">
              <h1 className="text-2xl font-semibold">Sign Up</h1>
              <div className="divide-y divide-gray-200">
                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                  <InputField
                    label="First Name"
                    id="fname"
                    type="text"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                  />
                  <InputField
                    label="Last Name"
                    id="lname"
                    type="text"
                    value={lname}
                    onChange={(e) => setLname(e.target.value)}
                  />
                  <InputField
                    label="Email Address"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <InputField
                    label="Password"
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  
                  <div className="relative">
                    <button
                      type="submit"
                      className="bg-cyan-500 text-white rounded-md px-2 py-1 w-full"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-right mt-2">
                Already registered? <a href="/login" className="text-blue-500">Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function InputField({ label, id, type, value, onChange }) {
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        value={value}
        autoComplete="off"
        className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-rose-600"
        placeholder={label}
        onChange={onChange}
        required
      />
      <label
        htmlFor={id}
        className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
      >
        {label}
      </label>
    </div>
  );
}

export default Register;
