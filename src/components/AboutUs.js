import Navbar from "./header";
import Footer from "./footer";
import React from "react";

function AboutUs() {
  return (
    <div>
      <Navbar />
      {/* About Us Section */}
      <section className="bg-gradient-to-b from-blue-50 to-blue-100 py-16">
        <div className="container mx-auto px-6">
          {/* Title */}
          <h2 className="text-4xl font-extrabold text-gray-800 text-center">About Us</h2>
          <p className="mt-4 text-xl text-gray-700 text-center">
            At Exam Ease Proctor, we combine technology, innovation, and ethics to create a seamless, secure, and inclusive online exam environment.
          </p>

          {/* Community Work Culture */}
          <div className="mt-16 grid md:grid-cols-2 gap-8">
            <div className="flex flex-col justify-center items-center">
              {/* <img
                src="../assets/images/community.jpg"
                alt="Community"
                className="rounded-lg shadow-lg w-full h-80 object-cover"
              /> */}
              <div className="w-full h-80 bg-cover bg-center rounded-lg object-cover bg-[url('../assets/images/community.jpg')]" />
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-gray-800">Our Community Work Culture</h3>
              <p className="mt-4 text-gray-600">
                At Exam Ease Proctor, our core values of <strong>collaboration</strong>, <strong>innovation</strong>, and{" "}
                <strong>commitment</strong> drive everything we do. Our team believes in creating solutions that empower educators and students alike. We thrive in a culture that fosters:
              </p>
              <ul className="mt-6 space-y-4 list-disc list-inside text-gray-600">
                <li><strong>Inclusivity:</strong> Designing tools that cater to diverse needs.</li>
                <li><strong>Transparency:</strong> Open communication within our team ensures ideas are heard.</li>
                <li><strong>Continuous Learning:</strong> Staying updated with cutting-edge technologies.</li>
                <li><strong>Responsibility:</strong> Emphasizing data security and ethical practices.</li>
              </ul>
            </div>
          </div>

          {/* Methodology */}
          <div className="mt-16">
            <h3 className="text-3xl font-bold text-gray-800 text-center">Our Methodology</h3>
            <p className="mt-4 text-lg text-gray-700 text-center">
              We follow a structured and phased approach to ensure the highest standards of functionality and user satisfaction in Exam Ease Proctor.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="p-8 bg-white rounded-lg shadow-lg">
                <h4 className="text-xl font-semibold text-gray-800">1. System Design</h4>
                <p className="mt-4 text-gray-600">Building a solid foundation using:</p>
                <ul className="mt-4 list-disc list-inside text-gray-600">
                  <li><strong>Django</strong> for backend development.</li>
                  <li><strong>React</strong> for dynamic frontend.</li>
                  <li><strong>Tailwind CSS</strong> for responsive UI/UX.</li>
                  <li><strong>Firebase</strong> for scalable, secure database management.</li>
                </ul>
              </div>
              <div className="p-8 bg-white rounded-lg shadow-lg">
                <h4 className="text-xl font-semibold text-gray-800">2. Implementation of Monitoring Features</h4>
                <p className="mt-4 text-gray-600">Ensuring integrity with real-time monitoring:</p>
                <ul className="mt-4 list-disc list-inside text-gray-600">
                  <li>Webcam integration for live proctoring.</li>
                  <li>Activity tracking to log suspicious actions.</li>
                  <li>Alert mechanisms for instant notifications.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Efforts Section */}
          <div className="mt-16">
            <h3 className="text-3xl font-bold text-gray-800 text-center">Our Efforts</h3>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col justify-center items-center">
                {/* <img
                  src="../assets/images/effort.jpg"
                  alt="Efforts"
                  className="rounded-lg shadow-lg w-full h-80 object-cover"
                /> */}
                <div className="w-full h-80 bg-cover bg-center rounded-lg object-cover bg-[url('../assets/images/effort.jpg')]" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-lg text-gray-600">
                  Creating the Exam Ease Proctor system was a labor of love and dedication by a diverse team of developers, designers, and domain experts. From brainstorming sessions to late-night debugging, every step was driven by our vision of transforming online examinations.
                </p>
                <ul className="mt-6 space-y-4 list-disc list-inside text-gray-600">
                  <li>Understanding the challenges of online proctoring.</li>
                  <li>Developing cutting-edge AI models for live monitoring.</li>
                  <li>Ensuring accessibility and ease of use for all users.</li>
                  <li>Testing rigorously to eliminate vulnerabilities.</li>
                </ul>
                <p className="mt-4 text-gray-600">
                  We are proud to bring this innovative solution to life and look forward to empowering educators and students worldwide.
                </p>
              </div>
            </div>
          </div>

          {/* Image with Motivational Quote */}
          <div className="mt-16 bg-gray-200 py-12">
            <div className="container mx-auto px-6 text-center">
              {/* <img
                src="../assets/images/innovation.jpg"
                alt="Innovation"
                className="rounded-lg shadow-lg mb-6 w-full"
              /> */}
              <div className="w-full h-80 bg-cover bg-center rounded-lg object-cover bg-[url('../assets/images/innovation.jpg')]" />
              <h4 className="text-3xl font-semibold text-gray-800">Empowering Education Through Technology</h4>
              <p className="mt-4 text-lg text-gray-600">
                Our mission is to bridge the gap between traditional examination methods and the future of digital assessment with integrity, security, and ease.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default AboutUs;
