const redis = require("redis");

// Create and connect the Redis client once
const client = redis.createClient({
  host: "localhost",
  port: 6379,
});

client
  .connect()
  .then(() => {
    console.log("Connected to Redis successfully");
  })
  .catch((err) => {
    console.error("Error connecting to Redis:", err);
  });

const cacheDuration = 3600; // Default cache expiry time (1 hour) just for testing - should be changed to smaller value

const cacheMiddleware = async (req, res, next) => {
  const cacheKey = req.originalUrl;

  try {
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      // Data found in cache, return directly
      console.log("This response is from the cache");
      return res.status(200).json(JSON.parse(cachedData));
    }

    // No cached data, proceed with the original request
    const originalSend = res.send.bind(res);
    res.send = async (body) => {
      // Add data to cache
      await client.set(cacheKey, body, "EX", cacheDuration);
      console.log(`Response for "${cacheKey}" cached successfully.`);

      // Call the original res.send method
      originalSend(body);
    };

    next();
  } catch (err) {
    console.error("Error using cache:", err);
    // Let the request continue without caching (optional error handling)
    next();
  }
};

module.exports = cacheMiddleware;
