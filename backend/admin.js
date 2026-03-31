// createAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

mongoose.connect("mongodb://127.0.0.1:27017/queueDB");

(async () => {
  const hashed = await bcrypt.hash("Admin@123", 10);

  await mongoose.connection.collection("users").insertOne({
    name: "Admin",
    email: "admin@gmail.com",
    password: hashed,
    role: "admin"
  });

  console.log("Admin created");
  process.exit();
})();