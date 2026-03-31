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

/* DATABASE */
mongoose.connect("mongodb://127.0.0.1:27017/queueDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("DB Error:", err));

/* AUTH MIDDLEWARE */
const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

/* REGISTER */
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashed,
      role: "student"
    });

    res.json({
      success: true,
      message: "Registered successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
});

/* LOGIN */
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    //  DO NOT reveal which is wrong
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

/* CURRENT USER */
app.get("/me", auth, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

/* BOOK TOKEN */
app.post("/token", auth, async (req, res) => {
  try {
    const existing = await Token.findOne({
      studentId: req.user.id,
      status: "waiting"
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Token already booked"
      });
    }

    const tokensAhead = await Token.countDocuments({ status: "waiting" });

    const token = await Token.create({
      studentId: req.user.id,
      studentName: req.user.name,
      feeType: req.body.feeType
    });

    io.emit("queueUpdated");

    res.json({
      success: true,
      data: {
        tokenNo: token._id,
        tokensAhead,
        waitingTime: tokensAhead * AVG_SERVICE_TIME,
        position: tokensAhead + 1
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Token booking failed"
    });
  }
});

/* QUEUE */
app.get("/queue", async (req, res) => {
  try {
    const queue = await Token.find({ status: "waiting" }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: queue
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch queue"
    });
  }
});

/* NEXT TOKEN */
app.post("/next", auth, async (req, res) => {
  try {
    const next = await Token.findOneAndUpdate(
      { status: "waiting" },
      { status: "completed" },
      { sort: { createdAt: 1 }, returnDocument: 'after'}
    );

    io.emit("queueUpdated");

    res.json({
      success: true,
      data: next
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to process next token"
    });
  }
});

/* ANALYTICS */
app.get("/analytics", async (req, res) => {
  try {
    const waitingTokens = await Token.find({ status: "waiting" });

    const avgTime =
      waitingTokens.length > 0
        ? waitingTokens.length * AVG_SERVICE_TIME
        : 0;

    res.json({
      success: true,
      data: {
        totalWaiting: waitingTokens.length,
        avgTime
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Analytics error"
    });
  }
});

/* SOCKET */
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
});

/* SERVER */
server.listen(5000, () => console.log("Server running on port 5000"));