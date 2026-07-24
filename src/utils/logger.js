const winston = require("winston");
const env = require("../config/env");

const logger = winston.createLogger({
  level: env.nodeEnv === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

module.exports = logger;

// Your own basic logger without winston
// const fs = require('fs');

// function log(level, message) {
//   const timestamp = new Date().toISOString();
//   const line = `[${timestamp}] ${level}: ${message}\n`;

//   console.log(line);                              // print to terminal
//   fs.appendFileSync('logs/combined.log', line);   // save to file

//   if (level === 'ERROR') {
//     fs.appendFileSync('logs/error.log', line);    // save errors separately
//   }
// }

// log('INFO', 'Server started');
// log('ERROR', 'DB failed');
