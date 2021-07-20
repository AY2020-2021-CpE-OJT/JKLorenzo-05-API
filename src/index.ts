import express, { json } from "express";
import mongodb from "mongodb";
import { load } from "./modules/Router.js";

const uri = process.env.URI!;
const port = process.env.PORT!;

const app = express().use(json());
const client = new mongodb.MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log("Connecting to the database");
await client.connect();

console.log("Loading all routes");
await load(app, client);

console.log("Starting");
await app.listen(port);

console.log("Ready");
