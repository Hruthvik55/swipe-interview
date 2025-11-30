import React from 'react'
import { Upload, Typography, Card, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'
import { useDispatch } from 'react-redux'
import { setCandidate } from '../slices/sessionSlice'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const { Title } = Typography

const Interviewee = () => {
  const dispatch = useDispatch()
  const [candidateInfo, setCandidateInfo] = React.useState(null)

  const handleFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    let text = ""

    try {
      if (ext === 'pdf') {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        for (let i = 0; i < pdf.numPages; i++) {
          const page = await pdf.getPage(i + 1)
          const content = await page.getTextContent()
          text += content.items.map((s) => s.str).join(' ') + '\n'
        }
      } else if (ext === 'docx') {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        text = result.value
      } else {
        message.error("Unsupported file type!")
        return false
      }

      // Extract info
      const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)?.[0] || null
      const phone = text.match(/(\+?\d[\d\s-]{8,15})/)?.[0] || null

      let name = null
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length > 0) name = lines[0]

      if (!name) name = "Unknown"

      const info = { name, email, phone }
      setCandidateInfo(info)

      // only store candidate temporarily
      dispatch(setCandidate({ ...info, rawText: text }))

      message.success("Resume Uploaded Successfully!")
    } catch (err) {
      console.log(err)
      message.error("Failed to read file!")
    }

    return false
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <Title level={3}> Upload Resume </Title>

        <Upload.Dragger
          accept=".pdf,.docx"
          customRequest={({ file }) => handleFile(file)}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">Click or drag PDF/DOCX here</p>
        </Upload.Dragger>
      </Card>

      {candidateInfo && (
        <Card title="Candidate Info" style={{ marginTop: 20 }}>
          <p><b>Name:</b> {candidateInfo.name}</p>
          <p><b>Email:</b> {candidateInfo.email}</p>
          <p><b>Phone:</b> {candidateInfo.phone}</p>

          <p style={{ marginTop: 10, color: "gray" }}>
            (Resume uploaded successfully. Waiting for interviewer to screen.)
          </p>
        </Card>
      )}
    </div>
  )
}

export default Interviewee
