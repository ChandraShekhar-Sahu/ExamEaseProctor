import { useEffect, useState } from "react";
import { auth, database } from "../services/firebase";
import { ref, get } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import React from "react";
import LoadingDots from "./LoadingDots";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userId = user.uid;
          const userRef = ref(database, `Users/${userId}`);
          const userSnapshot = await get(userRef);

          if (!userSnapshot.exists()) {
            console.error("User data does not exist in the database");
            navigate("/login");
            return;
          }

          const userData = userSnapshot.val();
          const storedSessionKey = localStorage.getItem("sessionKey");

          if (userData.sessionKey === storedSessionKey) {
            setIsAuthenticated(true);
          } else {
            console.error("Session key mismatch");
            navigate("/login");
          }
        } catch (error) {
          console.error("Error during session validation:", error.message);
          navigate("/login");
        } finally {
          setLoading(false);
        }
      } else {
        console.error("No user is currently authenticated");
        navigate("/login");
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [navigate]);

  if (loading) return <LoadingDots />;

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
