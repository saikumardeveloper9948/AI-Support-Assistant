const express = require("express");
const router = express.Router();
const db = require("../db");
const fs = require("fs");

const path = require("path");

const docsPath = path.join(__dirname, "../docs.json");
const docs = JSON.parse(fs.readFileSync(docsPath, "utf8"));
console.log("Loaded Docs:", docs);

function findRelevantDocs(question) {
  const lower = question.toLowerCase();

  return docs.filter(
    (doc) =>
      lower.includes(doc.title.toLowerCase()) ||
      (lower.includes("password") && doc.title === "Reset Password") ||
      (lower.includes("refund") && doc.title === "Refund Policy"),
  );
}

router.post("/chat", async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message required" });
    }

    const relevantDocs = findRelevantDocs(message);

    if (relevantDocs.length === 0) {
      const reply = "Sorry, I don’t have information about that.";

      // Store session
      db.run(`INSERT OR IGNORE INTO sessions(id) VALUES(?)`, [sessionId]);

      // Store user message
      db.run(`INSERT INTO messages(session_id, role, content) VALUES(?,?,?)`, [
        sessionId,
        "user",
        message,
      ]);

      // Store assistant reply
      db.run(`INSERT INTO messages(session_id, role, content) VALUES(?,?,?)`, [
        sessionId,
        "assistant",
        reply,
      ]);

      return res.json({
        reply,
        tokensUsed: 0,
      });
    }

    // Get last 10 messages (5 pairs)
    db.all(
      `SELECT role, content FROM messages 
       WHERE session_id = ? 
       ORDER BY created_at DESC LIMIT 10`,
      [sessionId],
      async (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });

        const context = rows
          .reverse()
          .map((r) => `${r.role}: ${r.content}`)
          .join("\n");

        const prompt = `
          You are a support assistant.
          Only answer using the provided documentation.
          If answer not in docs, say: "Sorry, I don’t have information about that."
                
          Documentation:
          ${JSON.stringify(relevantDocs)}
                
          Conversation:
          ${context}
                
          User Question:
          ${message}
          `;

        // Example using OpenAI

        const axios = require("axios");

        let reply;

        try {
          const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              model: "openrouter/auto",
              messages: [{ role: "user", content: prompt }],
            },
            {
              headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
              },
            },
          );

          reply = response.data.choices[0].message.content;
        } catch (error) {
          console.error("LLM Error:", error.response?.data || error.message);
          reply = "Sorry, I don’t have information about that.";
        }
        db.run(`INSERT OR IGNORE INTO sessions(id) VALUES(?)`, [sessionId]);
        db.run(
          `INSERT INTO messages(session_id, role, content) VALUES(?,?,?)`,
          [sessionId, "user", message],
        );
        db.run(
          `INSERT INTO messages(session_id, role, content) VALUES(?,?,?)`,
          [sessionId, "assistant", reply],
        );

        res.json({
          reply,
          tokensUsed: 0,
        });
      },
    );
  } catch (error) {
    res.status(500).json({ error: "LLM failure" });
  }
});

router.get("/conversations/:sessionId", (req, res) => {
  const { sessionId } = req.params;

  db.all(
    `SELECT role, content, created_at
     FROM messages
     WHERE session_id = ?
     ORDER BY created_at ASC`,
    [sessionId],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    },
  );
});


router.get("/sessions", (req, res) => {
  db.all(
    `SELECT id, updated_at 
     FROM sessions 
     ORDER BY updated_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.json(rows);
    }
  );
});


module.exports = router;
