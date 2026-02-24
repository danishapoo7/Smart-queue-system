require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const User = require("./models/User");
const Token = require("./models/Token");

const admin = require("./config/firebase"); // Firebase config

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

/* SOCKET SERVER */
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/* CONSTANTS */
const SECRET = "mysecret";
const AVG_SERVICE_TIME = 5;

/* DATABASE CONNECTION (MongoDB Atlas) */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Mongo error:", err));

/* ===========================
   AUTH MIDDLEWARE
=========================== */
const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) return res.status(401).send("No token");

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send("Invalid token");
  }
};


/* SAVE FCM TOKEN */
app.post("/save-fcm", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      fcmToken: req.body.fcmToken
    });

    res.json({ message: "FCM token saved" });
  } catch (err) {
    res.status(500).send("Error saving FCM");
  }
});
/* ===========================
   REGISTER
=========================== */
app.post("/register", async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashed,
      role: "student",
    });

    res.json(user);
  } catch (err) {
    res.status(500).send("Register error");
  }
});

/* ===========================
   LOGIN
=========================== */
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("User not found");

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(400).send("Wrong password");

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).send("Login error");
  }
});

/* ===========================
   CURRENT USER
=========================== */
app.get("/me", auth, (req, res) => res.json(req.user));

/* ===========================
   BOOK TOKEN
=========================== */
app.post("/token", auth, async (req, res) => {
  try {
    const existing = await Token.findOne({
      studentId: req.user.id,
      status: "waiting",
    });

    if (existing)
      return res.status(400).json({ message: "Already booked" });

    const tokensAhead = await Token.countDocuments({
      status: "waiting",
    });

    const token = await Token.create({
      studentId: req.user.id,
      studentName: req.user.name,
      feeType: req.body.feeType,
    });

    io.emit("queueUpdated");

    res.json({
      tokenNo: token._id,
      tokensAhead,
      waitingTime: tokensAhead * AVG_SERVICE_TIME,
      position: tokensAhead + 1,
    });
  } catch (err) {
    res.status(500).send("Token error");
  }
});

/* ===========================
   QUEUE
=========================== */
app.get("/queue", async (req, res) => {
  const queue = await Token.find({ status: "waiting" }).sort({
    createdAt: 1,
  });
  res.json(queue);
});

/* ===========================
   NEXT TOKEN
=========================== */
app.post("/next", auth, async (req, res) => {
  try {
    const next = await Token.findOneAndUpdate(
      { status: "waiting" },
      { status: "completed" },
      { sort: { createdAt: 1 }, new: true }
    );

    if (!next) return res.status(400).json({ message: "No tokens" });

    // 🔥 get student
    const student = await User.findById(next.studentId);

    // 🔥 send notification only if token exists
    if (student?.fcmToken) {
      await admin.messaging().send({
        notification: {
          title: "Queue Alert",
          body: "Your turn now!",
        },
        token: student.fcmToken,
      });
    }

    io.emit("queueUpdated");
    res.json(next);

  } catch (err) {
    console.log("Next error:", err);
    res.status(500).json({ message: "Next token error" });
  }
});

/* ===========================
   ANALYTICS
=========================== */
app.get("/analytics", async (req, res) => {
  try {
    const waitingTokens = await Token.find({
      status: "waiting",
    });

    const avgTime =
      waitingTokens.length > 0
        ? waitingTokens.length * AVG_SERVICE_TIME
        : 0;

    res.json({
      totalWaiting: waitingTokens.length,
      avgTime,
    });
  } catch (err) {
    res.status(500).send("Analytics error");
  }
});

/* ===========================
   SOCKET CONNECTION
=========================== */
io.on("connection", (s) => console.log("Socket:", s.id));

/* ===========================
   SERVER START (Render)
=========================== */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});