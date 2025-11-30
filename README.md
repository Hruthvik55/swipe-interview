Swipe-Interview: AI Resume Screening & Candidate Evaluation System

Swipe-Interview is an AI-assisted resume screening and candidate evaluation tool.
It streamlines resume uploads, parsing, screening, keyword scoring, and candidate management through a simple and efficient interface.

1. Overview

This project allows:

Interviewees to upload resumes.

Interviewers to screen and evaluate multiple resumes automatically.

Automatic extraction of key candidate details.

A dashboard that stores and displays screened candidates.

The system performs automated resume text extraction (PDF/DOCX/OCR), keyword-based matching using a job description, and organizes resumes into structured folders (pending, screened).

2. What the Agent Does
Resume Upload

Accepts PDF and DOCX formats.

Extracts text using:

pdf-parse

mammoth

Tesseract (OCR fallback for scanned PDFs)

Stores resumes in a pending queue for screening.

Resume Screening

Extracts basic details including:

Name

Email

Phone number

Computes a simple keyword match score based on job description.

Moves scanned resumes from “pending” to “screened”.

Updates interviewer dashboard with parsed information.

Dashboard

Displays all screened applicants.

Shows their name, contact details, and keyword score.

Helps interviewers manage and compare candidates quickly.

3. Features

End-to-end automated resume workflow.

Multi-format resume parsing (PDF, DOCX).

OCR support for non-text PDFs.

File organization into pending and screened states.

Screen one or all resumes at once.

Modern frontend interface (React + Ant Design).

Clear separation between UI and backend API.

Deployed frontend and backend for demonstration.

4. Limitations

Name extraction depends on resume text formatting.

OCR processing is slower for scanned files.

Keyword matching is based on exact word matches, not semantic similarity.

Some PDF parsing utilities behave differently across Linux environments.

DNS propagation delay may affect the backend URL immediately after deployment.

Note:
If there is any issue accessing the backend due to DNS propagation delay, the reviewers can simply clone or fork the repository and run the backend locally. The code is fully functional.

5. Tools and Technologies Used
Backend

Node.js

Express

pdf-parse

mammoth

tesseract.js

pdf-poppler

Frontend

React

Vite

Redux Toolkit

Ant Design UI Components

Deployment

Frontend: Render (Static Site Hosting)

Backend: Railway (Node.js Web Service)

6. Live Links

Frontend (Working Demo):
https://swipe-interview-1.onrender.com/

GitHub Repository:
https://github.com/Hruthvik55/swipe-interview

Backend API (Note: DNS may take time to propagate):
https://swipe-interview-production.up.railway.app

7. Local Development Setup
Clone the repository
git clone https://github.com/Hruthvik55/swipe-interview
cd swipe-interview

Frontend setup
npm install
npm run dev


Runs on:
http://localhost:5173

Backend setup
cd backend
npm install
node index.js


Runs on:
http://localhost:5000

8. Project Architecture

Flow:
Interviewee uploads resume → Backend stores it → Interviewer screens → System extracts text → Computes score → Moves to screened → Dashboard updates.

The architecture clearly separates:

Frontend UI

Backend API

File storage

Screening logic

OCR fallback logic
