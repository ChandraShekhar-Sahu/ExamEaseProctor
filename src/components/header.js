import React, { useState, useEffect } from "react";
import { auth } from "../services/firebase"; // Replace with your actual Firebase config file path
import { Link } from "react-router-dom"; // Import Link from react-router-dom for navigation


function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user); // Set isAuthenticated to true if a user is logged in
    });

    return unsubscribe; // Cleanup the listener on unmount
  }, []);

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev); // Toggle the menu
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  async function handleLogout() {
    try {
      await auth.signOut();
      localStorage.removeItem("sessionKey"); // Remove session key from local storage
      window.location.href = "/"; // Redirect to login page
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  return (
    <header className="bg-neutral-200 backdrop-blur-lg fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-screen-xl md:px-4 lg:px-10">
        <div className="flex h-12 items-center">
          {/* Home Icon on the left */}
          <div className="flex-none">
            <Link to="/" className="flex items-center text-gray-800 transition hover:text-gray-500/75">
              {/* <img
                src="../assets/images/home.jpg" 
                alt="Home"
                className="w-6 h-6" // Adjust size as needed
              /> */}
              <div className="w-6 h-6 bg-cover bg-center bg-[url('../assets/images/home.jpg')]" />
            </Link>
          </div>

          {/* Center Navigation Links */}
          
          <div className="flex-1 flex justify-center">
            {isAuthenticated ? (
            <nav aria-label="Global">
              <ul className="flex items-center gap-4 text-base sm:text-sm md:text-lg">
                <li>
                  <a
                    className="text-gray-800 transition hover:text-gray-500/75"
                    href="aboutUs"
                  >
                    About
                  </a>
                </li>

                <li>
                  <a
                    className="text-gray-800 transition hover:text-gray-500/75"
                    href="/exams"
                    
                  >
                    Exams
                  </a>
                </li>
                <li>
                  <a className="text-gray-800 transition hover:text-gray-500/75" href="/create-exam">
                    Create Exam
                  </a>
                </li>
              </ul>
            </nav>
            ):(
            <div></div>
          )
          }
          </div>
          

          {/* Dropdown Menu on the right */}
          <div className="relative flex-none items-center">
            <button
              type="button"
              className="overflow-hidden rounded-full border border-gray-300 shadow-inner"
              onClick={handleToggleMenu}
            >
              <span className="sr-only">Toggle dashboard menu</span>
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScRBB4s6BbGlsq2E2LQJ4QzCofMmWxtfsWsg&s"
                alt="Profile"
                className="size-8 object-cover"
              />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg">
                <ul className="py-1">
                  {isAuthenticated ? (
                    <>
                      <li>
                        <a
                          href="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 hover:font-bold"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </a>
                      </li>
                      <li>
                        <a
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-200 hover:font-bold"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profile
                        </a>
                      </li>
                      <li>
                        <a
                          className="block px-4 py-2 text-sm text-red-700 hover:bg-gray-200 hover:font-bold"
                          onClick={handleLogout}
                        >
                          Logout
                        </a>
                      </li>
                    </>
                  ) : (
                    <li>
                      <a
                        href="login"
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-slate-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
