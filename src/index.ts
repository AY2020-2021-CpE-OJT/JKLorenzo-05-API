import express from "express";
import mongodb from "mongodb";
import RouteManager from "./modules/RouteManager.js";

const uri = process.env.URI!;
const port = process.env.PORT!;

const app = express();
const client = new mongodb.MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const router = new RouteManager(app, client);

console.log("Connecting to the database");
await client.connect();

console.log("Loading all routes");
await router.load();

console.log("Starting");
await app.listen(port);

console.log("Ready");
