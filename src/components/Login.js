import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get, update } from "firebase/database";
import React, { useState } from "react";
import { auth, database } from "../services/firebase";
import { ToastContainer, toast } from "react-toastify";
import SignInwithGoogle from "./signInWithGoogle";
import { v4 as uuidv4 } from "uuid";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Fetch user data from Realtime Database
      const userRef = ref(database, `Users/${userId}`);
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) {
        throw new Error("User not found in Realtime Database. Please register first.");
      }

      const userData = userSnapshot.val();

      // Check if email matches stored data
      if (userData.email !== email) {
        throw new Error("Email does not match records. Please try again.");
      }

      // Generate and store session key
      const sessionKey = uuidv4();
      await update(userRef, { sessionKey });
      localStorage.setItem("sessionKey", sessionKey);

      // Successful login
      toast.success("Login successful! Redirecting...", { position: "top-center" });
      setTimeout(() => {
        window.location.href = "/exams";
      });
    } catch (error) {
      console.error("Login Error:", error.message);
      toast.error(error.message || "Login failed. Please try again.", {
        position: "bottom-center",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-6 flex flex-col justify-center sm:py-12">
      <ToastContainer />
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-semibold">Login</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 mt-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <div className="mb-4">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-sky-500 text-white py-2 rounded-md hover:bg-sky-600 transition-colors"
              >
                {isLoggingIn ? "Logging in..." : "Login"}
              </button>
            </form>
            <div className="mt-4">
              <SignInwithGoogle />
            </div>
            <h2 className="flex items-end justify-end">If you do not have a Account  &nbsp;
              <a href="/register" className="text-blue-700"> Register</a></h2>
           
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
