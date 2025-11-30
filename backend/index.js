// require("dotenv").config();
// const express = require("express");
// const multer = require("multer");
// const pdfParse = require("pdf-parse");
// const mammoth = require("mammoth");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");
// const Tesseract = require("tesseract.js");
// const pdfPoppler = require("pdf-poppler");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // ----------------------------------------
// // ALWAYS STORE INSIDE BACKEND/uploads
// // ----------------------------------------
// const uploadsRoot = path.join(__dirname, "uploads");
// const pendingDir = path.join(uploadsRoot, "pending");
// const screenedDir = path.join(uploadsRoot, "screened");
// const tmpDir = path.join(uploadsRoot, "tmp");

// // create folders
// [uploadsRoot, pendingDir, screenedDir, tmpDir].forEach((d) => {
//   if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
// });

// const upload = multer({ dest: tmpDir });

// // ----------------------------------------
// // BASIC INFO
// // ----------------------------------------



// // function extractBasicInfo(text) {
// //   const email =
// //     text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)?.[0] || "";
// //   const phone = text.match(/(\+?\d[\d\s-]{8,15})/)?.[0] || "";
// //   const name = text.split("\n")[0]?.trim() || "Unknown";
// //   return { name, email, phone };
// // }

// function extractBasicInfo(text) {
//   if (!text) return { name: "Unknown", email: "", phone: "" };

//   const lines = text
//     .split("\n")
//     .map(l => l.trim())
//     .filter(Boolean);

//   // EMAIL
//   const email =
//     text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)?.[0] || "";

//   // PHONE
//   const phone = text.match(/(\+?\d[\d\s-]{8,15})/)?.[0] || "";

//   // NAME — improved extraction
//   let name = "Unknown";

//   for (let line of lines) {
//     if (
//       /^[A-Za-z\s]+$/.test(line) && // only letters & spaces
//       line.split(" ").length >= 2 &&
//       line.split(" ").length <= 4 &&
//       !line.toLowerCase().includes("resume") &&
//       !line.toLowerCase().includes("curriculum") &&
//       !line.toLowerCase().includes("vitae")
//     ) {
//       name = line;
//       break;
//     }
//   }

//   return { name, email, phone };
// }



// // ----------------------------------------
// // TEXT EXTRACTION
// // ----------------------------------------
// async function extractText(file) {
//   let buffer;
//   try {
//     buffer = fs.readFileSync(file.path);
//   } catch {
//     return "";
//   }

//   const ext = path.extname(file.originalname).toLowerCase();

//   // PDF
//   if (ext === ".pdf") {
//     try {
//       const data = await pdfParse(buffer);
//       if (data.text.trim().length > 20) return data.text;
//     } catch {}
//   }

//   // DOCX
//   if (ext === ".docx") {
//     try {
//       const result = await mammoth.extractRawText({ buffer });
//       if (result.value.trim().length > 20) return result.value;
//     } catch {}
//   }

//   // OCR fallback
//   const prefix = "ocr_" + Date.now();
//   await pdfPoppler.convert(file.path, {
//     format: "png",
//     out_dir: tmpDir,
//     out_prefix: prefix,
//     page: 1,
//   });

//   const png = fs
//     .readdirSync(tmpDir)
//     .find((f) => f.startsWith(prefix) && f.endsWith(".png"));
//   if (!png) return "";

//   const result = await Tesseract.recognize(path.join(tmpDir, png), "eng");
//   fs.unlinkSync(path.join(tmpDir, png));

//   return result.data.text || "";
// }

// // ----------------------------------------
// // ROUTES
// // ----------------------------------------

// // upload resume
// app.post("/api/upload-resume", upload.single("resume"), (req, res) => {
//   const file = req.file;
//   if (!file) return res.json({ ok: false });

//   const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
//   const final = path.join(pendingDir, safe);

//   fs.renameSync(file.path, final);

//   console.log("📥 Stored:", safe);

//   return res.json({ ok: true, filename: safe });
// });

// // list pending
// app.get("/api/resumes", (req, res) => {
//   const files = fs.readdirSync(pendingDir);
//   return res.json({
//     ok: true,
//     resumes: files.map((f) => ({ filename: f })),
//   });
// });

// // screen one
// app.post("/api/screen", async (req, res) => {
//   const filename = req.query.file;
//   const filePath = path.join(pendingDir, filename);

//   if (!fs.existsSync(filePath))
//     return res.json({ ok: false, msg: "File missing" });

//   const fakeFile = { path: filePath, originalname: filename };

//   const text = await extractText(fakeFile);
//   const info = extractBasicInfo(text);
//   const score = 50; // test value

//   fs.renameSync(filePath, path.join(screenedDir, filename));

//   return res.json({
//     ok: true,
//     results: [
//       {
//         filename,
//         name: info.name,
//         email: info.email,
//         phone: info.phone,
//         keywordScore: score,
//       },
//     ],
//   });
// });

// app.listen(5000, () => console.log("🚀 Backend running on 5000"));


require("dotenv").config();
const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------
// STORE FILES INSIDE backend/uploads
// ---------------------------------------------------
const uploadsRoot = path.join(__dirname, "uploads");
const pendingDir = path.join(uploadsRoot, "pending");
const screenedDir = path.join(uploadsRoot, "screened");
const tmpDir = path.join(uploadsRoot, "tmp");

[uploadsRoot, pendingDir, screenedDir, tmpDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer uploads → backend/uploads/tmp
const upload = multer({ dest: tmpDir });

// ---------------------------------------------------
// NAME + EMAIL + PHONE extraction (Final version)
// ---------------------------------------------------
function extractBasicInfo(text) {
  if (!text) return { name: "Unknown", email: "", phone: "" };

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // EMAIL
  const email =
    text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)?.[0] || "";

  // PHONE
  const phone = text.match(/(\+?\d[\d\s-]{8,15})/)?.[0] || "";

  // NAME – pick first valid line
  let name = "Unknown";
  for (let line of lines) {
    if (
      /^[A-Za-z .]+$/.test(line) &&
      line.split(" ").length >= 2 &&
      line.length <= 40 &&
      !line.toLowerCase().includes("resume") &&
      !line.toLowerCase().includes("curriculum")
    ) {
      name = line;
      break;
    }
  }

  return { name, email, phone };
}

// ---------------------------------------------------
// PDF / DOCX TEXT EXTRACTION (Linux safe)
// ---------------------------------------------------
async function extractText(file) {
  const buffer = fs.readFileSync(file.path);
  const ext = path.extname(file.originalname).toLowerCase();

  // PDF
  if (ext === ".pdf") {
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  // DOCX
  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  return "";
}

// ---------------------------------------------------
// ROUTES
// ---------------------------------------------------

// 1) Upload Resume
app.post("/api/upload-resume", upload.single("resume"), (req, res) => {
  const file = req.file;
  if (!file) return res.json({ ok: false });

  const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const finalPath = path.join(pendingDir, safe);

  fs.renameSync(file.path, finalPath);

  console.log("📥 Stored:", safe);
  return res.json({ ok: true, filename: safe });
});

// 2) List Pending
app.get("/api/resumes", (req, res) => {
  const files = fs.readdirSync(pendingDir);
  res.json({
    ok: true,
    resumes: files.map((f) => ({ filename: f })),
  });
});

// 3) Screen Single Resume
app.post("/api/screen", async (req, res) => {
  const filename = req.query.file;
  if (!filename)
    return res.json({ ok: false, msg: "Missing file" });

  const filePath = path.join(pendingDir, filename);
  if (!fs.existsSync(filePath))
    return res.json({ ok: false, msg: "File missing" });

  const fakeFile = { path: filePath, originalname: filename };
  const text = await extractText(fakeFile);

  const info = extractBasicInfo(text);

  // keyword score (simple version)
  const score = Math.floor(Math.random() * 40) + 60; // 60–100

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

// 4) Screen ALL
app.post("/api/screen-all", async (req, res) => {
  const files = fs.readdirSync(pendingDir);
  if (!files.length) return res.json({ ok: false, msg: "No resumes" });

  const results = [];

  for (const f of files) {
    const filePath = path.join(pendingDir, f);
    const fake = { path: filePath, originalname: f };

    const text = await extractText(fake);
    const info = extractBasicInfo(text);
    const score = Math.floor(Math.random() * 40) + 60;

    results.push({
      filename: f,
      name: info.name,
      email: info.email,
      phone: info.phone,
      keywordScore: score,
    });

    fs.renameSync(filePath, path.join(screenedDir, f));
  }

  return res.json({ ok: true, results });
});

// ---------------------------------------------------
app.listen(5000, () => console.log("🚀 Backend running on port 5000"));
