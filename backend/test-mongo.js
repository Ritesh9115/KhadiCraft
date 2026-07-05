const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const uri = process.env.MONGODB_URI;
  console.log("Connecting to:", uri.replace(/:([^:@]{3,})@/, ':***@'));
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log("✅ Connected successfully to server");
    await client.close();
  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err);
  }
}
run();
