import { Router } from "express";
import { MongoClient } from "mongodb";
import AuthManager from "../../../modules/AuthManager.js";

export default function (router: Router, client: MongoClient): Router {
  return router.post("/", AuthManager.register);
}
