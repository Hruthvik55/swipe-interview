import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCandidate } from "../slices/sessionSlice";
import { Card, Button, Typography, message } from "antd";

const { Title, Text } = Typography;

export default function ScreenResumes() {
  const dispatch = useDispatch();
  const storedJD = useSelector((state) => state.jd.description); // 🔥 Get JD from Redux
  const [resumes, setResumes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ❗ Block if JD not set
  if (!storedJD) {
    return (
      <div style={{ padding: 30 }}>
        <Card>
          <Title level={3}>Job Description Not Set</Title>
          <Text type="secondary">
            Please go to <b>Set JD</b> page and save a Job Description before screening resumes.
          </Text>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumes.length) return message.error("Upload at least one resume!");

    setLoading(true);

    const formData = new FormData();
    resumes.forEach((file) => formData.append("resumes", file));

    // 🔥 Send stored JD
    formData.append("jobDescription", storedJD);

    const resp = await fetch("http://localhost:5000/api/screen", {
      method: "POST",
      body: formData,
    });

    const data = await resp.json();
    setResults(data.results || []);
    setLoading(false);

    // 🔥 Push candidates into dashboard
    data.results.forEach((res) => {
      dispatch(
        addCandidate({
          name: res.name,
          email: res.email,
          phone: res.phone,
          score: res.keywordScore,
          answers: [], // no interview answers
        })
      );
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card>
        <Title level={3}>Resume Screening Agent</Title>

        {/* SHOW CURRENT JD */}
        <div
          style={{
            padding: "15px",
            background: "#f7f7f7",
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
          <Title level={5}>Current Job Description</Title>
          <Text>{storedJD}</Text>
        </div>

        <form onSubmit={handleSubmit}>
          <label><b>Upload Resumes (PDF/DOCX/TXT):</b></label> <br />
          <input
            type="file"
            multiple
            onChange={(e) => setResumes([...e.target.files])}
          />

          <br /><br />

          <Button type="primary" htmlType="submit" disabled={loading}>
            {loading ? "Screening..." : "Screen Resumes"}
          </Button>
        </form>
      </Card>

      {results.length > 0 && (
        <Card style={{ marginTop: "30px" }}>
          <Title level={4}>Results</Title>
          <table border="1" cellPadding="8" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Filename</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, index) => (
                <tr key={index}>
                  <td>{r.filename}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.phone}</td>
                  <td>{r.keywordScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
