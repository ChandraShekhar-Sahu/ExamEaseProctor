import React, { Component } from "react";
import Login from'./Login';
import Register from'./Register';
import Notify from './Notifytoast';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from "./profile";
import Dashboard from "./Dashboard";
import CreateExam from './CreateExam';
import TakeExam from "./TakeExam";
import LandingPage from "./LandingPage";
import Exams from "./Exams";
import ProtectedRoute from "./ProtectedRoute";
import AboutUs from "./AboutUs";
import ExamRulesCamera from "./ExamRulesCamera";

export default class HomePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router >
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/aboutUs" element={<AboutUs />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
              <Route path="/create-exam" element={<ProtectedRoute><CreateExam /></ProtectedRoute>} />
              <Route path="/takeexam/:examId" element={<ProtectedRoute><TakeExam /></ProtectedRoute>} />
              <Route path="/register" element={<Register />} />
              <Route path="/pre-exam" element={<ProtectedRoute><ExamRulesCamera /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/notify" element={<Notify />} />
              
              
            </Routes>
          </Router>
        );
    }
}