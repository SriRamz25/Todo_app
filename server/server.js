const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Improve mongoose connection logging and increase server selection timeout so
// we get clearer errors instead of silent buffering timeouts.
const mongooseOptions = {
  // modern parsers / topology (kept for compatibility)
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // increase timeout so Atlas has more time to respond during deploys
  serverSelectionTimeoutMS: 30000,
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions).then(() => {
  console.log("MongoDB connected");
}).catch((err) => {
  console.error("MongoDB initial connection error:", err && err.message ? err.message : err);
});

// Better runtime connection event logging
mongoose.connection.on("connected", () => {
  console.log("Mongoose event: connected");
});
mongoose.connection.on("error", (err) => {
  console.error("Mongoose event: error:", err && err.message ? err.message : err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose event: disconnected");
});

app.get("/api/health", (req, res) => {
  res.json({ message: "Server running!" });
});

app.use("/api/todos", require("./routes/todos"));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Health: http://localhost:${PORT}/api/health`);
});
