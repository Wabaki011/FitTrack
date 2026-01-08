const express = require("express");
const path = require("path");
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "FitTrack API is live 🚀"
  });
});

app.use("/api", routes);

// For any other request, serve the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
