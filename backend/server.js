const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const User = require("./models/User");
const Token = require("./models/Token");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const SECRET = "mysecret";
const AVG_SERVICE_TIME = 5;

const admin = require("../config/firebase");

/* DATABASE */
mongoose.connect("mongodb://127.0.0.1:27017/queueDB")
.then(() => console.log("MongoDB connected"));

/* AUTH */
const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    console.log("No token header");
    return res.status(401).send("No token");
  }

  try {
    const token = header.split(" ")[1];
    console.log("Token received:", token);

    const decoded = jwt.verify(token, SECRET);
    console.log("Decoded user:", decoded);

    req.user = decoded;
    next();

  } catch (err) {
    console.log("JWT error:", err.message);
    res.status(401).send("Invalid token");
  }
};

/* REGISTER */
app.post("/register", async (req, res) => {
  const hashed = await bcrypt.hash(req.body.password, 10);

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashed,
    role: "student"
  });

  res.json(user);
});

/* LOGIN */
app.post("/login", async (req, res) => {
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
});

/* CURRENT USER */
app.get("/me", auth, (req, res) => res.json(req.user));

/* BOOK TOKEN */
app.post("/token", auth, async (req, res) => {
  const existing = await Token.findOne({
    studentId: req.user.id,
    status: "waiting"
  });

  if (existing) return res.status(400).json({ message: "Already booked" });

  const tokensAhead = await Token.countDocuments({ status: "waiting" });

  const token = await Token.create({
    studentId: req.user.id,
    studentName: req.user.name,
    feeType: req.body.feeType
  });

  io.emit("queueUpdated");

  res.json({
    tokenNo: token._id,
    tokensAhead,
    waitingTime: tokensAhead * AVG_SERVICE_TIME,
    position: tokensAhead + 1
  });
});

/* QUEUE */
app.get("/queue", async (req, res) => {
  const queue = await Token.find({ status: "waiting" }).sort({ createdAt: 1 });
  res.json(queue);
});

/* NEXT */
app.post("/next", auth, adminAuth, async (req, res) => {

  await admin.messaging().send({
  notification: {
    title: "Queue Alert",
    body: "Your turn now!",
  },
  token: student.fcmToken,
});
  const next = await Token.findOneAndUpdate(
    { status: "waiting" },
    { status: "completed" },
    { sort: { createdAt: 1 }, new: true }
  );

  io.emit("queueUpdated");
  res.json(next);
});
/*analytics */
app.get("/analytics", async (req, res) => {
  try {
    const waitingTokens = await Token.find({ status: "waiting" });

    const avgTime =
      waitingTokens.length > 0
        ? waitingTokens.length * AVG_SERVICE_TIME
        : 0;

    res.json({
      totalWaiting: waitingTokens.length,
      avgTime
    });
  } catch (err) {
    res.status(500).send("Analytics error");
  }
});

/* SOCKET */
io.on("connection", s => console.log("Socket:", s.id));

server.listen(5000, () => console.log("Server running"));