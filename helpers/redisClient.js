import redis from "redis";

// Create a Redis client
const client = redis.createClient({
    url: "redis://redis:6379", // Use the Redis service name from Docker Compose
  });

// Handle Redis connection errors
client.on("error", (err) => {
    console.error("Redis error: ", err);
});

// Connect to Redis
client.connect();

export default client;
