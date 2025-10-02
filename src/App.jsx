import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import Interviewee from "./pages/Interviewee";
import Interviewer from "./pages/Interviewer";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
import InterviewerLogin from "./pages/InterviewerLogin";



const { Header, Content } = Layout;

function AppLayout() {
  const location = useLocation();

  const keyMap = {
    "/": "0",
    "/interviewee": "1",
    "/interviewer": "2",
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Navbar */}
      <Header>
        <Menu theme="dark" mode="horizontal" selectedKeys={[keyMap[location.pathname] || "0"]}>
          <Menu.Item key="0">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="1">
            <Link to="/interviewee">Interviewee</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/interviewer">Interviewer</Link>
          </Menu.Item>
        </Menu>
      </Header>

      {/* Page Content */}
<Content style={{ padding: "20px" }}>
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/interviewee" element={<Interviewee />} />
    <Route path="/interviewer-login" element={<InterviewerLogin />} />
    <Route
      path="/interviewer"
      element={
        <ProtectedRoute>
          <Interviewer />
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
