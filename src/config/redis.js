const { Redis } = require("ioredis");
const env = require("./env");
const logger = require("../utils/logger");

// BullMQ requires maxRetriesPerRequest: null on the connection it manages
const connection = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password || undefined,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 2000, 10000);
    return delay;
  },
});

connection.on("connect", () => logger.info("Redis connected"));
connection.on("error", (err) => logger.warn(`Redis notice: ${err.message}`));

module.exports = connection;
