import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import http from "http";
import { Server } from "socket.io";
import {generateAIResponse} from "./aiEngine.js";

dotenv.config();

const app = express();
app.use(cors());

const server = http.createServer(app); 

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const upload = multer({ dest: "uploads/" });

/* =========================
   In-memory stores
========================= */
let incidents = [];
let calls = [];
let insights = [];
/* =========================
   Safe JSON parser
========================= */
function safeParseJSON(text) {
  if (!text || typeof text !== "string") return null;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}
async function generateInsights(transcript, incident) {
  try {
    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-30b",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `
You are an AI emergency response system used by fire control rooms.

Analyze emergency calls and generate CRITICAL actionable insights.

Rules:
- Output ONLY JSON
- Max 5 insights
- Short and actionable
- Focus on risk, danger, response

Format:
[
  {
    "message": "",
    "severity": "low | medium | high"
  }
]
`,
          },
          {
            role: "user",
            content: `
Transcript:
${transcript}

Incident:
${JSON.stringify(incident)}
`,
          },
        ],
      }),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";

    return safeParseJSON(content) || [];
  } catch (err) {
    console.error("Insight error:", err);
    return [];
  }
}
/* =========================
   Extract structured data
========================= */
async function extractInfo(text) {
  try {
    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-30b",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `
Extract structured emergency info.

Return ONLY JSON:
{
  "location": "",
  "incident_type": "",
  "people": number,
  "severity": "",
  "hazards": []
}
`,
          },
          {
            role: "user",
            content: text,
          },
        ],
      }),
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const parsed = safeParseJSON(content);

    return (
      parsed || {
        location: "Unknown",
        incident_type: "Unknown",
        people: 0,
        severity: "Medium",
        hazards: [],
      }
    );
  } catch {
    return {
      location: "Unknown",
      incident_type: "Unknown",
      people: 0,
      severity: "Medium",
      hazards: [],
    };
  }
}

/* =========================
   Matching logic
========================= */
function isSimilarLocation(a, b) {
  if (!a || !b) return false;
  return a.toLowerCase().includes(b.toLowerCase());
}

function findMatchingIncident(data) {
  return incidents.find((i) =>
    isSimilarLocation(i.location, data.location)
  );
}

/* =========================
   Merge logic
========================= */
function mergeIncident(existing, incoming) {
  return {
    ...existing,
    people: Math.max(existing.people, incoming.people),
    hazards: [...new Set([...existing.hazards, ...incoming.hazards])],
    severity:
      existing.severity === "High" || incoming.severity === "High"
        ? "High"
        : "Medium",
    calls: existing.calls + 1,
    confidence: Math.min(100, existing.confidence + 10),
  };
}

/* =========================
   Routes
========================= */

app.get("/state", (req, res) => {
  res.json({ calls, incidents, insights, actions: [] });
});

/*  MAIN */
app.post("/process-audio", upload.single("audio"), async (req, res) => {
  try {
    const filePath = req.file.path;

    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("model", "saaras:v3");
    formData.append("mode", "translate");

    const sttRes = await fetch("https://api.sarvam.ai/speech-to-text", {
      method: "POST",
      headers: {
        "api-subscription-key": process.env.SARVAM_API_KEY,
      },
      body: formData,
    });

    const sttData = await sttRes.json();
    const transcript = sttData.transcript || "";

    const structuredData = await extractInfo(transcript);

    let incident = findMatchingIncident(structuredData);

    if (incident) {
      incident = mergeIncident(incident, structuredData);
      incidents = incidents.map((i) =>
        i.id === incident.id ? incident : i
      );
    } else {
      incident = {
        id: incidents.length + 1,
        ...structuredData,
        calls: 1,
        confidence: 60,
      };
      incidents.push(incident);
    }

    const newCall = {
      id: Date.now(),
      transcript,
      location: structuredData.location,
      incidentId: incident.id,
      timestamp: new Date(),
    };

    calls.unshift(newCall);

    const aiData = await generateAIResponse(transcript, incident);

// add priority to incident
incident.priority = aiData.priority;

// update insights (replace old one)
insights = aiData.insights.map((ins, i) => ({
  id: Date.now() + i,
  message: ins.message,
  severity: ins.severity,
}));

// OPTIONAL (store actions if you want later)
const actions = aiData.actions || [];


    const aiInsights = await generateInsights(transcript, incident);

insights = aiInsights.map((ins, i) => ({
  id: Date.now() + i,
  message: ins.message,
  severity: ins.severity,
}));
    fs.unlinkSync(filePath);

    
    io.emit("update", { calls, incidents, insights, actions});

    res.json({ transcript, incident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================
   SOCKET CONNECTION
========================= */

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.emit("update", { calls, incidents });
});

/* =========================
   START SERVER
========================= */

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});