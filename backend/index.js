require("dotenv").config();
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Tesseract = require("tesseract.js");
const pdfPoppler = require("pdf-poppler");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// -------------------------------------
// OCR + TEXT EXTRACTION
// -------------------------------------
async function extractText(file) {
  const buffer = fs.readFileSync(file.path);
  const ext = path.extname(file.originalname).toLowerCase();

  try {
    if (ext === ".pdf") {
      const data = await pdfParse(buffer);
      if (data.text && data.text.trim().length > 30) {
        console.log("📄 Extracted PDF text");
        return data.text;
      }
      console.log("🤖 PDF text too little → switching to OCR");
    }

    if (ext === ".docx" || ext === ".doc") {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value.trim().length > 20) {
        console.log("📄 Extracted DOCX text");
        return result.value;
      }
      console.log("🤖 DOCX text too small → switching to OCR");
    }
  } catch (err) {
    console.log("⚠️ Primary extraction failed:", err.message);
  }

  // OCR fallback
  console.log("🧠 Running OCR fallback…");

  const imgPath = path.join(__dirname, "ocr_page.png");

  try {
    await pdfPoppler.convert(file.path, {
      format: "png",
      out_dir: __dirname,
      out_prefix: "ocr_page",
      page: 1,
    });

    console.log("📸 PDF → PNG conversion done, applying OCR…");

    const result = await Tesseract.recognize(imgPath, "eng");
    fs.unlinkSync(imgPath);

    console.log("✅ OCR complete");
    return result.data.text;
  } catch (err) {
    console.log("❌ OCR failed:", err.message);
    return "";
  }
}

// -------------------------------------
// Extract Name / Email / Phone
// -------------------------------------
function extractBasicInfo(text) {
  const email =
    text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)?.[0] || "";

  const phone =
    text.match(/(\+?\d[\d\s-]{8,15})/)?.[0]?.trim() || "";

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let name = "Unknown";
  if (lines.length > 0) name = lines[0].split(" ").slice(0, 3).join(" ");

  return { name, email, phone };
}

// -------------------------------------
// Keyword Score
// -------------------------------------
function keywordScore(resumeText, jdText) {
  const jdWords = jdText.toLowerCase().split(/\W+/).filter(Boolean);
  const resumeWords = resumeText.toLowerCase().split(/\W+/);
  const resumeSet = new Set(resumeWords);

  let matches = 0;
  jdWords.forEach((word) => {
    if (resumeSet.has(word)) matches++;
  });

  return Math.round((matches / jdWords.length) * 100 || 0);
}

// -------------------------------------
// Resume Screening API
// -------------------------------------
app.post("/api/screen", upload.array("resumes"), async (req, res) => {
  console.log("🔥 API HIT: /api/screen");

  try {
    const jdText = req.body.jobDescription || "";
    const files = req.files;

    let results = [];

    for (let file of files) {
      const resumeText = await extractText(file);
      const score = keywordScore(resumeText, jdText);

      const basic = extractBasicInfo(resumeText);

      results.push({
        filename: file.originalname,
        keywordScore: score,
        name: basic.name,
        email: basic.email,
        phone: basic.phone,
      });

      fs.unlinkSync(file.path);
    }

    res.json({ ok: true, results });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// -------------------------------------
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
