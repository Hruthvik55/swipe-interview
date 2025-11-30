import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setJobDescription } from "../slices/jdSlice";
import { Card, Input, Button, Typography, message } from "antd";

const { Title } = Typography;
const { TextArea } = Input;

export default function SetJd() {
  const dispatch = useDispatch();
  const storedJD = useSelector((state) => state.jd.description);
  const [jd, setJdText] = useState(storedJD);

  const saveJD = () => {
    if (!jd.trim()) {
      return message.error("Job description cannot be empty!");
    }
    dispatch(setJobDescription(jd));
    message.success("Job Description Saved!");
  };

  return (
    <div style={{ padding: 30, maxWidth: 800, margin: "0 auto" }}>
      <Card>
        <Title level={3}>Set Job Description</Title>
        <TextArea
          rows={8}
          value={jd}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste Job Description Here..."
        />
        <Button type="primary" block style={{ marginTop: 20 }} onClick={saveJD}>
          Save Job Description
        </Button>
      </Card>
    </div>
  );
}
