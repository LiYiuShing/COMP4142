const setting = {
  port: "6379",
  host: "127.0.0.1",
};

const client = require("redis").createClient(setting);
const Redis = require("ioredis");
const redis = new Redis(setting);

redis.on("ready", () => {
  console.log("create redis server successfully");
});

redis.on("error", (error) => {
  console.log("Create redis server fail"), error;
});

module.exports = {
  client,
  redis,
};

// Sample Usage

// client.set("key", "vassslue", (error, result) => {
//   console.log(error, result);
//   // if (error) {
//   //   res.status(500).json({ error: error });
//   // }
// });
// client.get("key", (error, result) => {
//   console.log(error, result);
//   // if (error) {
//   //   res.status(500).json({ error: error });
//   // }
// });
