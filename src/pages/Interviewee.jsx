import React from "react";
import { Upload, Typography, Card, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { setCandidate } from "../slices/sessionSlice";

const { Title } = Typography;

// Use env var if present, else fallback to your Railway URL
const API_BASE = import.meta.env.VITE_API_URL || "https://swipe-interview-production.up.railway.app";

export default function Interviewee() {
  const dispatch = useDispatch();
  const [candidateInfo, setCandidateInfo] = React.useState(null);

  // customRequest receives an options object from antd Upload
  const handleFile = async (options) => {
    // options.file or options.file.originFileObj depending on antd usage
    const realFile = options?.file?.originFileObj || options?.file || options;

    if (!realFile) {
      message.error("Invalid file");
      return false;
    }

    const formData = new FormData();
    formData.append("resume", realFile);

    try {
      const resp = await fetch(`${API_BASE}/api/upload-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await resp.json();

      if (!data.ok) {
        message.error(data.msg || "Upload failed");
        return false;
      }

      const name = realFile.name.split(".")[0] || data.filename || "Unknown";
      const info = { name, email: null, phone: null };

      setCandidateInfo(info);
      dispatch(setCandidate({ ...info, rawText: "" }));

      message.success("Resume uploaded successfully!");
    } catch (err) {
      console.error("upload error:", err);
      message.error("Upload error");
    }

    // tell antd upload that we handled it
    return false;
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <Card>
        <Title level={3}>Upload Resume</Title>

        <Upload.Dragger
          accept=".pdf,.doc,.docx"
          customRequest={handleFile}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag PDF/DOCX here</p>
        </Upload.Dragger>
      </Card>

      {candidateInfo && (
        <Card title="Candidate Info" style={{ marginTop: 20 }}>
          <p>
            <b>Name:</b> {candidateInfo.name}
          </p>
          <p>
            <b>Email:</b> {candidateInfo.email || "N/A"}
          </p>
          <p>
            <b>Phone:</b> {candidateInfo.phone || "N/A"}
          </p>

          <p style={{ marginTop: 10, color: "gray" }}>
            (Resume uploaded successfully. Waiting for interviewer to screen.)
          </p>
        </Card>
      )}
    </div>
  );
}
