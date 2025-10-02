import React from 'react'
import { Upload, Typography, Button, Card, Divider, Input, Progress, Steps, Collapse } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url'
import { useDispatch } from 'react-redux'
import { setCandidate, addCandidate } from '../slices/sessionSlice'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

const { Title } = Typography
const { TextArea } = Input
const { Step } = Steps
const { Panel } = Collapse

// Question bank with keywords
const questions = [
  { type: 'easy', text: 'What is React?', time: 20, keywords: ['library', 'javascript', 'ui', 'components'] },
  { type: 'easy', text: 'Explain useState hook.', time: 20, keywords: ['state', 'hook', 'function', 'react'] },
  { type: 'medium', text: 'What is the difference between let, var, and const in JS?', time: 60, keywords: ['scope', 'block', 'hoisting', 'reassign'] },
  { type: 'medium', text: 'Explain event loop in Node.js.', time: 60, keywords: ['asynchronous', 'callback', 'queue', 'non-blocking'] },
  { type: 'hard', text: 'How would you scale a MERN app for millions of users?', time: 120, keywords: ['load balancing', 'clustering', 'database', 'caching', 'horizontal', 'scaling'] },
  { type: 'hard', text: 'What are the trade-offs of monolith vs microservices?', time: 120, keywords: ['modularity', 'scalability', 'deployment', 'complexity', 'coupling'] },
]

const Interviewee = () => {
  const [parsedText, setParsedText] = React.useState('')
  const [candidateInfo, setCandidateInfo] = React.useState(null)
  const [step, setStep] = React.useState('upload')
  const [currentQ, setCurrentQ] = React.useState(0)
  const [timeLeft, setTimeLeft] = React.useState(0)
  const [answer, setAnswer] = React.useState('')
  const [answers, setAnswers] = React.useState([])
  const [finalScore, setFinalScore] = React.useState(null)
  const dispatch = useDispatch()

  // 🆕 Voice helper
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  // Timer
  React.useEffect(() => {
    if (step === 'interview' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
      return () => clearTimeout(timer)
    } else if (step === 'interview' && timeLeft === 0 && questions[currentQ]) {
      handleNext()
    }
  }, [timeLeft, step, currentQ])

  const handleFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    let text = ''

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
      alert('Unsupported file type')
      return
    }

    setParsedText(text)

    const email = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)?.[0] || null
    const phone = text.match(/(\+?\d[\d\s-]{8,15})/)?.[0] || null

    let name = null
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length > 0) {
      let firstLine = lines[0]
      firstLine = firstLine.replace(/[§|#ï]/g, '').trim()
      const words = firstLine.split(' ')
      if (words.length > 3) {
        firstLine = words.slice(0, 3).join(' ')
      }
      name = firstLine
    }
    if (!name && email) {
      const beforeEmail = text.split(email)[0].trim().split('\n').pop()
      name = beforeEmail || null
    }
    if (!name) name = 'Unknown'

    const info = { name, email, phone }
    setCandidateInfo(info)

    dispatch(setCandidate({ ...info, rawText: text }))
    setStep('ready')

    return false
  }

  const startInterview = () => {
    speak("Let's start the interview!") // 🆕 fun voice
    setStep('interview')
    setCurrentQ(0)
    setTimeLeft(questions[0].time)
    speak(questions[0].text) // 🆕 read first question
  }

  const handleNext = () => {
    const q = questions[currentQ]
    const wordCount = answer.split(/\s+/).filter(Boolean).length

    // Keyword-based scoring
    let keywordMatches = 0
    if (q.keywords) {
      const ansLower = answer.toLowerCase()
      keywordMatches = q.keywords.filter(k => ansLower.includes(k.toLowerCase())).length
    }

    let qScore = 0
    if (q.type === 'easy') {
      qScore = (wordCount >= 10 ? 5 : 2) + keywordMatches * 2
      if (qScore > 10) qScore = 10
    } else if (q.type === 'medium') {
      qScore = (wordCount >= 20 ? 10 : 5) + keywordMatches * 3
      if (qScore > 20) qScore = 20
    } else if (q.type === 'hard') {
      qScore = (wordCount >= 30 ? 15 : 7) + keywordMatches * 3
      if (qScore > 30) qScore = 30
    }

    const newAnswers = [
      ...answers,
      { q: q.text, a: answer || '(no answer)', type: q.type, score: qScore },
    ]
    setAnswers(newAnswers)
    setAnswer('')

    if (currentQ < questions.length - 1) {
      const nextQ = currentQ + 1
      setCurrentQ(nextQ)
      setTimeLeft(questions[nextQ].time)
      speak(questions[nextQ].text) // 🆕 read next question
    } else {
      const total = newAnswers.reduce((acc, ans) => acc + ans.score, 0)
      setFinalScore(total)

      const finalData = { ...candidateInfo, answers: newAnswers, score: total }
      dispatch(addCandidate(finalData))
      setStep('done')
      speak("Interview completed! Well done.") // 🆕 voice outro
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      {step === 'upload' && (
        <Card>
          <Title level={3}> Upload Resume</Title>
          <Upload.Dragger
            accept=".pdf,.docx"
            customRequest={({ file }) => handleFile(file)}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Click or drag PDF/DOCX here</p>
          </Upload.Dragger>
        </Card>
      )}

      {step === 'ready' && candidateInfo && (
        <Card title="Candidate Info" style={{ marginTop: 20 }}>
          <p><b>Name:</b> {candidateInfo.name}</p>
          <p><b>Email:</b> {candidateInfo.email}</p>
          <p><b>Phone:</b> {candidateInfo.phone}</p>
          <Divider />
          <Button type="primary" onClick={startInterview}>🚀 Start Interview</Button>
        </Card>
      )}

      {step === 'interview' && (
        <Card style={{ marginTop: 20 }}>
          <Steps size="small" current={currentQ}>
            {questions.map((q, i) => (
              <Step key={i} title={`Q${i + 1}`} />
            ))}
          </Steps>
          <Divider />
          <Title level={4}>{questions[currentQ].text}</Title>
          <Progress percent={(timeLeft / questions[currentQ].time) * 100} showInfo={false} status="active" />
          <p style={{ marginTop: 8 }}>⏱Time left: {timeLeft}s</p>
          <TextArea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            placeholder="Type your answer here..."
            style={{ marginTop: 10 }}
          />
          <Button type="primary" block style={{ marginTop: 15 }} onClick={handleNext}>
            {currentQ === questions.length - 1 ? ' Finish Interview' : '➡ Next Question'}
          </Button>
        </Card>
      )}

      {step === 'done' && (
        <Card title=" Interview Complete" style={{ marginTop: 20 }}>
          <p><b>Final Score:</b></p>
          <Progress type="circle" percent={(finalScore / (questions.length * 10)) * 100} />
          <Divider />
          <Title level={5}>Your Answers</Title>
          <Collapse accordion>
            {answers.map((item, idx) => (
              <Panel header={`Q${idx + 1}: ${item.q}`} key={idx}>
                <p><b>Answer:</b> {item.a}</p>
                <p><b>Score:</b> {item.score} / {item.type === 'easy' ? 10 : item.type === 'medium' ? 20 : 30}</p>
              </Panel>
            ))}
          </Collapse>
        </Card>
      )}
    </div>
  )
}

export default Interviewee
