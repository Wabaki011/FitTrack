const express = require("express");
const path = require("path");
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred on the server.',
    // In production, you might not want to send the full error stack
    // error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

module.exports = app;
