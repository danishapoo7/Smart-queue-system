const bcrypt = require("bcryptjs");

bcrypt.hash("admin123", 10).then((hash) => {
  console.log("Hashed password:");
  console.log(hash);
});