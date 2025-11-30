import React, { useEffect, useState } from "react";
import { Button, Table, message, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addCandidate } from "../slices/sessionSlice";

export default function ScreenResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // if you have JD stored in redux, use it; otherwise fallback to default
  const jd = useSelector((state) => state.jd?.description) || "default JD";

  // Fetch pending resumes
  const loadResumes = async () => {
    try {
      const resp = await fetch("http://localhost:5000/api/resumes");
      const data = await resp.json();
      if (data.ok) {
        setResumes(data.resumes || []);
      } else {
        setResumes([]);
      }
    } catch (err) {
      console.error("Load resumes error:", err);
      message.error("Failed to load resumes");
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  // Screen a single resume (stored pending file)
  const screenResume = async (filename) => {
    setLoading(true);
    try {
      const resp = await fetch(
        `http://localhost:5000/api/screen?file=${encodeURIComponent(filename)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription: jd }),
        }
      );

      const data = await resp.json();
      setLoading(false);

      if (!data.ok) {
        message.error(data.msg || "Screening failed");
        return;
      }

      // data.results is an array (single element here)
      (data.results || []).forEach((r) => {
        dispatch(
          addCandidate({
            name: r.name || r.filename,
            email: r.email || "N/A",
            phone: r.phone || "N/A",
            score: r.keywordScore ?? 0,
            answers: [],
          })
        );
      });

      message.success(`Screened: ${filename}`);
      // refresh list (moved to screened by backend)
      loadResumes();
    } catch (err) {
      console.error("Screen single error:", err);
      setLoading(false);
      message.error("Error screening resume");
    }
  };

  // Screen all pending resumes
  const screenAll = async () => {
    if (!resumes.length) {
      message.info("No pending resumes to screen");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch("http://localhost:5000/api/screen-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jd }),
      });

      const data = await resp.json();
      setLoading(false);

      if (!data.ok) {
        message.error(data.msg || "Screening all failed");
        return;
      }

      (data.results || []).forEach((r) => {
        dispatch(
          addCandidate({
            name: r.name || r.filename,
            email: r.email || "N/A",
            phone: r.phone || "N/A",
            score: r.keywordScore ?? 0,
            answers: [],
          })
        );
      });

      message.success("All resumes screened");
      loadResumes();
    } catch (err) {
      console.error("Screen all error:", err);
      setLoading(false);
      message.error("Error screening resumes");
    }
  };

  const columns = [
    { title: "Filename", dataIndex: "filename", key: "filename" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() => screenResume(record.filename)}
            loading={loading}
            size="small"
          >
            Screen
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Pending Resumes</h2>

      <Button
        type="primary"
        onClick={screenAll}
        loading={loading}
        style={{ marginBottom: 16 }}
      >
        Screen All Resumes
      </Button>

      <Table
        dataSource={resumes.map((r, i) => ({ ...r, key: i }))}
        columns={columns}
        pagination={false}
      />
    </div>
  );
}
