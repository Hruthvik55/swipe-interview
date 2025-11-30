import React, { useEffect, useState } from "react";
import { Button, Table, message, Space } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { addCandidate } from "../slices/sessionSlice";

// Read from env or use Railway URL
const API_BASE = import.meta.env.VITE_API_URL || "https://swipe-interview-production.up.railway.app";

export default function ScreenResumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const jd = useSelector((state) => state.jd?.description) || "default JD";

  const loadResumes = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/resumes`);
      const data = await resp.json();
      if (data.ok) setResumes(data.resumes || []);
      else setResumes([]);
    } catch (err) {
      console.error("load resumes:", err);
      message.error("Failed to load resumes");
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const screenResume = async (filename) => {
    setLoading(true);
    try {
      const resp = await fetch(
        `${API_BASE}/api/screen?file=${encodeURIComponent(filename)}`,
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
      await loadResumes();
    } catch (err) {
      console.error("screen single:", err);
      setLoading(false);
      message.error("Error screening resume");
    }
  };

  const screenAll = async () => {
    if (!resumes.length) {
      message.info("No pending resumes");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/screen-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jd }),
      });

      const data = await resp.json();
      setLoading(false);

      if (!data.ok) {
        message.error(data.msg || "Screen all failed");
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
      await loadResumes();
    } catch (err) {
      console.error("screen all:", err);
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
          <Button type="primary" size="small" onClick={() => screenResume(record.filename)} loading={loading}>
            Screen
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Pending Resumes</h2>

      <Button type="primary" onClick={screenAll} loading={loading} style={{ marginBottom: 16 }}>
        Screen All Resumes
      </Button>

      <Table dataSource={resumes.map((r, i) => ({ ...r, key: i }))} columns={columns} pagination={false} />
    </div>
  );
}
