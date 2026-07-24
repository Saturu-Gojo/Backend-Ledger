const { Redis } = require("ioredis");
const env = require("./env");
const logger = require("../utils/logger");

// BullMQ requires maxRetriesPerRequest: null on the connection it manages
const connection = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  maxRetriesPerRequest: null,
});

connection.on("connect", () => logger.info("Redis connected"));
connection.on("error", (err) => logger.error(`Redis error: ${err.message}`));

module.exports = connection;
