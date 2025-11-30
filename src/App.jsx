import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";

import Interviewee from "./pages/Interviewee";
import Interviewer from "./pages/Interviewer";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
import InterviewerLogin from "./pages/InterviewerLogin";
import ScreenResumes from "./pages/ScreenResumes";
import SetJd from "./pages/SetJd";   // 🔥 NEW PAGE

const { Header, Content } = Layout;

function AppLayout() {
  const location = useLocation();

  // 🔐 check interviewer login
  const isInterviewer = sessionStorage.getItem("interviewerAuth") === "true";

  const keyMap = {
    "/": "0",
    "/interviewee": "1",
    "/interviewer": "2",
    "/screen-resumes": "3",
    "/set-jd": "4",  // 🔥 NEW ROUTE
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[keyMap[location.pathname] || "0"]}
        >
          <Menu.Item key="0">
            <Link to="/">Home</Link>
          </Menu.Item>

          <Menu.Item key="1">
            <Link to="/interviewee">Interviewee</Link>
          </Menu.Item>

          <Menu.Item key="2">
            <Link to="/interviewer">Interviewer</Link>
          </Menu.Item>

          {/* 🔐 Show only when interviewer is logged in */}
          {isInterviewer && (
            <>
              <Menu.Item key="3">
                <Link to="/screen-resumes">Screen Resumes</Link>
              </Menu.Item>

              <Menu.Item key="4">
                <Link to="/set-jd">Set JD</Link>
              </Menu.Item>
            </>
          )}
        </Menu>
      </Header>

      {/* Page Content */}
      <Content style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/interviewee" element={<Interviewee />} />
          <Route path="/interviewer-login" element={<InterviewerLogin />} />

          {/* Protected interviewer dashboard */}
          <Route
            path="/interviewer"
            element={
              <ProtectedRoute>
                <Interviewer />
              </ProtectedRoute>
            }
          />

          {/* Protected screening page */}
          <Route
            path="/screen-resumes"
            element={
              <ProtectedRoute>
                <ScreenResumes />
              </ProtectedRoute>
            }
          />

          {/* 🔥 NEW — Protected Set JD Page */}
          <Route
            path="/set-jd"
            element={
              <ProtectedRoute>
                <SetJd />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Content>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
