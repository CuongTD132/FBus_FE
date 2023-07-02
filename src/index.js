import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./assets/scss/argon-dashboard-react.scss";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLayout from "./layouts/Admin";
import AuthLayout from "./layouts/Auth";
const user = localStorage.getItem('user');
const isAdmin = user && user.role === 'ADMIN';
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
     <Routes>
      {/* {isAdmin ? (
        <Route path="/admin/*" element={<AdminLayout />} />
      ) : (
        <Route path="/auth/*" element={<AuthLayout />} />
      )}
      <Route path="*" element={<Navigate to="/auth/login" replace />} /> */}
      <Route path="/admin/*" element={<AdminLayout />} />
      <Route path="/auth/*" element={<AuthLayout />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
    <ToastContainer />
  </BrowserRouter>

);
