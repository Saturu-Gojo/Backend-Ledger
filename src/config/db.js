const dns = require("dns");
const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    if (err.message.includes("querySrv ECONNREFUSED") || err.message.includes("querySrv ENOTFOUND")) {
      logger.warn("DNS SRV resolution failed with default local DNS. Retrying with Google/Cloudflare DNS...");
      try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
        await mongoose.connect(env.mongoUri);
        logger.info(`MongoDB connected via fallback DNS: ${mongoose.connection.host}`);
        return;
      } catch (retryErr) {
        logger.error(`MongoDB connection failed on retry: ${retryErr.message}`);
        process.exit(1);
      }
    }
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
};

module.exports = connectDB;
