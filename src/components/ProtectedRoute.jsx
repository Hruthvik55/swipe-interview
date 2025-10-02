import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthed = sessionStorage.getItem("interviewerAuth") === "true";

  if (!isAuthed) {
    return <Navigate to="/interviewer-login" replace />;
  }

  return children;
};

export default ProtectedRoute;
