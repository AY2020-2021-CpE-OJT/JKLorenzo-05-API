import { Router } from "express";
import { MongoClient } from "mongodb";

export default function (router: Router, client: MongoClient): Router {
  return router.get("/", async (req, res) => {
    console.log("status get");
    try {
      await res.send("online");
    } catch (error) {
      console.error(error);
      res.status(400).send(String(error));
    }
  });
}
