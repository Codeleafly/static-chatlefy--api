require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const winston = require("winston");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// === Logger Setup ===
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`)
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error"
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log")
    }),
    new winston.transports.Console()
  ],
});

// === Load from .env ===
const API_KEY = process.env.API_KEY;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const FIRST_USER_PASSWORD = process.env.PASSWORD;
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || [];

if (!API_KEY || !ENCRYPTION_KEY || !FIRST_USER_PASSWORD) {
  logger.error("Missing required .env configuration.");
  process.exit(1);
}

// === CORS Setup ===
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  }
};

// === Express Setup ===
const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());

// === AI Setup ===
const ai = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT_PATH = path.join(__dirname, "system.instruction.prompt");
let systemPromptText = "You are Chatlefy, an AI assistant made by Smart Tell Line...";
if (fs.existsSync(SYSTEM_PROMPT_PATH)) {
  systemPromptText = fs.readFileSync(SYSTEM_PROMPT_PATH, "utf-8");
} else {
  logger.warn("system.instruction.prompt not found, using default instruction.");
}

// === In-Memory Store ===
let userHistories = {};
let requestCounter = {};
const MAX_REQUESTS_PER_DAY = 50;

function resetCountersDaily() {
  requestCounter = {};
  setTimeout(resetCountersDaily, 24 * 60 * 60 * 1000);
}
resetCountersDaily();

// === Chat API ===
app.post("/chat", async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    logger.warn("Invalid request body");
    return res.status(400).json({ reply: "Invalid input" });
  }

  const cleanedMessage = message.trim();

  const isFirstAccess = !userHistories[userId];
  const isCorrectPassword = cleanedMessage === FIRST_USER_PASSWORD;

  if (isFirstAccess && !isCorrectPassword) {
    logger.warn(`Unauthorized access attempt by ${userId}`);
    return res.status(403).json({ reply: "Unauthorized access. Provide valid password." });
  }

  if (isFirstAccess && isCorrectPassword) {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
      generationConfig: { temperature: 1.0, topK: 1, topP: 1 },
      systemInstruction: { role: "system", parts: [{ text: systemPromptText }] },
    });

    const chat = model.startChat({ history: [] });
    userHistories[userId] = { model, chat };
    requestCounter[userId] = 0;
    logger.info(`User ${userId} authenticated and chat session started.`);
    return res.json({ reply: "Access granted. You can now start chatting." });
  }

  if (requestCounter[userId] >= MAX_REQUESTS_PER_DAY) {
    logger.warn(`User ${userId} exceeded daily request limit.`);
    return res.status(429).json({ reply: "Rate limit exceeded for today." });
  }

  try {
    requestCounter[userId]++;
    const result = await userHistories[userId].chat.sendMessage(cleanedMessage);
    res.json({ reply: result.response.text() });
  } catch (err) {
    logger.error(`Chat error for ${userId}: ${err.message}`);
    res.status(500).json({ reply: "Chatlefy is currently unavailable." });
  }
});

// === Start Server ===
app.listen(PORT, () => {
  logger.info(`Chatlefy running on http://localhost:${PORT}`);
});
