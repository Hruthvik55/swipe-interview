import React from "react"
import { Button, Card, Typography } from "antd"
import { Link } from "react-router-dom"
import { UserOutlined, TeamOutlined } from "@ant-design/icons"

const { Title, Text } = Typography

const Landing = () => {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #e0f7fa, #e3f2fd)",
        padding: 20,
      }}
    >
      <Card
        style={{
          textAlign: "center",
          padding: "50px 40px",
          borderRadius: "20px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
          backdropFilter: "blur(6px)",
        }}
      >
        <Title level={2} style={{ marginBottom: 10 }}>
          Welcome to Swipe-Interview
        </Title>
        <Text type="secondary">
          A smarter way to conduct and experience interviews.  
        </Text>

        <div style={{ marginTop: 40 }}>
          <Link to="/interviewee">
            <Button
              type="primary"
              size="large"
              icon={<UserOutlined />}
              style={{
                margin: 10,
                borderRadius: "10px",
                padding: "0 25px",
              }}
            >
              I’m a Candidate
            </Button>
          </Link>
          <Link to="/interviewer">
            <Button
              size="large"
              icon={<TeamOutlined />}
              style={{
                margin: 10,
                borderRadius: "10px",
                padding: "0 25px",
                background: "#fafafa",
              }}
            >
              I’m an Interviewer
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

export default Landing
