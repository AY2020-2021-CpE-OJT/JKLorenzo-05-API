import { Router } from "express";
import { MongoClient } from "mongodb";

export default interface Route {
  (router: Router, client: MongoClient): Router;
}
