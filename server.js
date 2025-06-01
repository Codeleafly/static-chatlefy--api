require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
const winston = require("winston");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
      level: "error",
      maxsize: 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.Console(),
  ],
});

// === Constants ===
const ENCRYPTED_API_FILE = path.join(__dirname, "encrypted.api-secure-00-qwertyzz00-un-guessable-.enc+encryption.app...AAdG");
const RUNTIME_FLAG_FILE = path.join(__dirname, "encrypt.runtime.hhhtt");
const SYSTEM_PROMPT_PATH = path.join(__dirname, "system.instruction.prompt");

const PORT = process.env.PORT || 3000;
const MAX_REQUESTS_PER_DAY = 50;
const PASSWORD = process.env.PASSWORD;
const RAW_ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
const ENV_API_KEY = process.env.API_KEY;

// Auto pad encryption key to 32 bytes
const ENCRYPTION_KEY = crypto.createHash("sha256").update(RAW_ENCRYPTION_KEY).digest("hex").slice(0, 32);

if (!PASSWORD || ENCRYPTION_KEY.length !== 32 || !ENV_API_KEY) {
  logger.error("Missing .env variables: PASSWORD, ENCRYPTION_KEY or API_KEY");
  process.exit(1);
}

const app = express();

// === CORS ===
const allowedOrigins = [
  "http://localhost:3000",
  "https://htmlcssjsvirsion.tiiny.site"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`Blocked CORS access attempt from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(bodyParser.json());

// === Utility Functions ===
function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + encrypted;
}

function decrypt(encryptedText, key) {
  const iv = Buffer.from(encryptedText.slice(0, 32), "hex");
  const encrypted = encryptedText.slice(32);
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

function loadOrEncryptAPIKey() {
  if (!fs.existsSync(RUNTIME_FLAG_FILE) || !fs.existsSync(ENCRYPTED_API_FILE)) {
    const encryptedKey = encrypt(ENV_API_KEY, ENCRYPTION_KEY);
    fs.writeFileSync(ENCRYPTED_API_FILE, encryptedKey);
    fs.writeFileSync(RUNTIME_FLAG_FILE, "ENCRYPTED: YES");
    logger.info("API key encrypted and stored from environment.");
    return ENV_API_KEY;
  } else {
    const encryptedKey = fs.readFileSync(ENCRYPTED_API_FILE, "utf-8");
    return decrypt(encryptedKey, ENCRYPTION_KEY);
  }
}

let API_KEY = loadOrEncryptAPIKey();

const ai = new GoogleGenerativeAI(API_KEY);

let systemPromptText = "You are Chatlefy, an AI assistant made by Smart Tell Line...";
if (fs.existsSync(SYSTEM_PROMPT_PATH)) {
  systemPromptText = fs.readFileSync(SYSTEM_PROMPT_PATH, "utf-8");
} else {
  console.error("system.instruction.prompt file does not exist.");
  logger.error("Missing system prompt file.");
}

let userHistories = {};
let requestCounter = {};

function resetCountersDaily() {
  requestCounter = {};
  setTimeout(resetCountersDaily, 24 * 60 * 60 * 1000);
}
resetCountersDaily();

app.post("/chat", async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    logger.warn("Invalid input received.");
    return res.status(400).json({ reply: "Invalid input" });
  }

  if (!message.includes(PASSWORD) && !userHistories[userId]) {
    logger.warn(`Unauthorized access attempt by ${userId}`);
    return res.status(403).json({ reply: "Unauthorized access. Provide password." });
  }

  if (!userHistories[userId] && message.includes(PASSWORD)) {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash-preview-05-20",
      generationConfig: { temperature: 1.0, topK: 1, topP: 1 },
      systemInstruction: { role: "system", parts: [{ text: systemPromptText }] },
    });
    const chat = model.startChat({ history: [] });
    userHistories[userId] = { model, chat };
    requestCounter[userId] = 0;
    logger.info(`User ${userId} authenticated.`);
    return res.json({ reply: "Access granted. You can now start chatting." });
  }

  if (requestCounter[userId] >= MAX_REQUESTS_PER_DAY) {
    logger.warn(`User ${userId} exceeded daily request limit.`);
    return res.status(429).json({ reply: "Rate limit exceeded for today." });
  }

  try {
    requestCounter[userId]++;
    const result = await userHistories[userId].chat.sendMessage(message);
    res.json({ reply: result.response.text() });
  } catch (err) {
    logger.error(`Chat error: ${err.message}`);
    res.status(500).json({ reply: "Chatlefy is currently unavailable." });
  }
});

app.listen(PORT, () => {
  logger.info(`Chatlefy running securely on http://localhost:${PORT}`);
});