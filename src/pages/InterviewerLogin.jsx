// src/pages/InterviewerLogin.jsx
import React, { useState } from "react";
import { Card, Input, Button, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const InterviewerLogin = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // ✅ Hardcoded password (MVP style)
    // before: const correctPassword = "1234";
const correctPassword = import.meta.env.VITE_INTERVIEWER_PASS || "1234";


    if (password === correctPassword) {
     sessionStorage.setItem("interviewerAuth", "true");

      message.success("Login successful!");
      navigate("/interviewer");
    } else {
      message.error("Incorrect password!");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
      <Card style={{ padding: 30, textAlign: "center" }}>
        <Title level={3}>Interviewer Login</Title>
        <Input.Password
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginTop: 20 }}
        />
        <Button
          type="primary"
          style={{ marginTop: 20, width: "100%" }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </Card>
    </div>
  );
};

export default InterviewerLogin;
