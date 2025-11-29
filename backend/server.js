const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// CORS WIDE OPEN (Fix Error Netlify + Railway)
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/data", require("./routes/data"));

// CONNECT MONGO
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("API is running");
});

// SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
