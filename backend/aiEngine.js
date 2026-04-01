// aiEngine.js

import fetch from "node-fetch";

/* =========================
   SAFE PARSER
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

/* =========================
   PRIORITY + ACTIONS + INSIGHTS
========================= */
export async function generateAIResponse(transcript, incident) {
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

Your job:
1. Generate CRITICAL INSIGHTS
2. Recommend ACTIONS
3. Determine PRIORITY

STRICT RULES:
- Output ONLY JSON
- No explanation text
- Max 5 insights
- Max 5 actions
- Keep sentences short and actionable

PRIORITY RULES:
- High → many people / high severity / dangerous hazards
- Medium → moderate risk
- Low → isolated / low risk

FORMAT:
{
  "priority": "Low | Medium | High",
  "insights": [
    { "message": "", "severity": "low | medium | high" }
  ],
  "actions": [
    { "message": "" }
  ]
}
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

    return safeParseJSON(content) || {
      priority: "Medium",
      insights: [],
      actions: [],
    };
  } catch (err) {
    console.error("AI Engine error:", err);

    return {
      priority: "Medium",
      insights: [],
      actions: [],
    };
  }
}