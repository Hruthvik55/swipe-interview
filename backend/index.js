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

// ----------------------------------------
// ALWAYS STORE INSIDE BACKEND/uploads
// ----------------------------------------
const uploadsRoot = path.join(__dirname, "uploads");
const pendingDir = path.join(uploadsRoot, "pending");
const screenedDir = path.join(uploadsRoot, "screened");
const tmpDir = path.join(uploadsRoot, "tmp");

// create folders
[uploadsRoot, pendingDir, screenedDir, tmpDir].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const upload = multer({ dest: tmpDir });

// ----------------------------------------
// BASIC INFO
// ----------------------------------------



// function extractBasicInfo(text) {
//   const email =
//     text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)?.[0] || "";
//   const phone = text.match(/(\+?\d[\d\s-]{8,15})/)?.[0] || "";
//   const name = text.split("\n")[0]?.trim() || "Unknown";
//   return { name, email, phone };
// }

function extractBasicInfo(text) {
  if (!text) return { name: "Unknown", email: "", phone: "" };

  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  // EMAIL
  const email =
    text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)?.[0] || "";

  // PHONE
  const phone = text.match(/(\+?\d[\d\s-]{8,15})/)?.[0] || "";

  // NAME — improved extraction
  let name = "Unknown";

  for (let line of lines) {
    if (
      /^[A-Za-z\s]+$/.test(line) && // only letters & spaces
      line.split(" ").length >= 2 &&
      line.split(" ").length <= 4 &&
      !line.toLowerCase().includes("resume") &&
      !line.toLowerCase().includes("curriculum") &&
      !line.toLowerCase().includes("vitae")
    ) {
      name = line;
      break;
    }
  }

  return { name, email, phone };
}



// ----------------------------------------
// TEXT EXTRACTION
// ----------------------------------------
async function extractText(file) {
  let buffer;
  try {
    buffer = fs.readFileSync(file.path);
  } catch {
    return "";
  }

  const ext = path.extname(file.originalname).toLowerCase();

  // PDF
  if (ext === ".pdf") {
    try {
      const data = await pdfParse(buffer);
      if (data.text.trim().length > 20) return data.text;
    } catch {}
  }

  // DOCX
  if (ext === ".docx") {
    try {
      const result = await mammoth.extractRawText({ buffer });
      if (result.value.trim().length > 20) return result.value;
    } catch {}
  }

  // OCR fallback
  const prefix = "ocr_" + Date.now();
  await pdfPoppler.convert(file.path, {
    format: "png",
    out_dir: tmpDir,
    out_prefix: prefix,
    page: 1,
  });

  const png = fs
    .readdirSync(tmpDir)
    .find((f) => f.startsWith(prefix) && f.endsWith(".png"));
  if (!png) return "";

  const result = await Tesseract.recognize(path.join(tmpDir, png), "eng");
  fs.unlinkSync(path.join(tmpDir, png));

  return result.data.text || "";
}

// ----------------------------------------
// ROUTES
// ----------------------------------------

// upload resume
app.post("/api/upload-resume", upload.single("resume"), (req, res) => {
  const file = req.file;
  if (!file) return res.json({ ok: false });

  const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const final = path.join(pendingDir, safe);

  fs.renameSync(file.path, final);

  console.log("📥 Stored:", safe);

  return res.json({ ok: true, filename: safe });
});

// list pending
app.get("/api/resumes", (req, res) => {
  const files = fs.readdirSync(pendingDir);
  return res.json({
    ok: true,
    resumes: files.map((f) => ({ filename: f })),
  });
});

// screen one
app.post("/api/screen", async (req, res) => {
  const filename = req.query.file;
  const filePath = path.join(pendingDir, filename);

  if (!fs.existsSync(filePath))
    return res.json({ ok: false, msg: "File missing" });

  const fakeFile = { path: filePath, originalname: filename };

  const text = await extractText(fakeFile);
  const info = extractBasicInfo(text);
  const score = 50; // test value

  fs.renameSync(filePath, path.join(screenedDir, filename));

  return res.json({
    ok: true,
    results: [
      {
        filename,
        name: info.name,
        email: info.email,
        phone: info.phone,
        keywordScore: score,
      },
    ],
  });
});

app.listen(5000, () => console.log("🚀 Backend running on 5000"));
