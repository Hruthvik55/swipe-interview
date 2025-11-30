import React from "react";
import { Upload, Typography, Card, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function Interviewee() {

  const handleFile = async (options) => {
    const realFile = options.file;  // <-- REAL FILE HERE

    const formData = new FormData();
    formData.append("resume", realFile);

    const resp = await fetch("http://localhost:5000/api/upload-resume", {
      method: "POST",
      body: formData,
    });

    const data = await resp.json();

    if (data.ok) {
      message.success("Uploaded!");
    } else {
      message.error("Failed!");
    }
  };

  return (
    <div style={{ padding: 20 }}>
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
          <p className="ant-upload-text">Drag or click to upload resume</p>
        </Upload.Dragger>
      </Card>
    </div>
  );
}
