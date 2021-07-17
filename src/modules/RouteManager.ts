import { join, relative } from "path";
import { pathToFileURL } from "url";
import { Express, Router, json } from "express";
import { MongoClient } from "mongodb";
import Route from "../structures/Route.js";
import { getFiles } from "../utils/Functions.js";

export default class RouteManager {
  private app: Express;
  private client: MongoClient;

  constructor(app: Express, client: MongoClient) {
    this.app = app.use(json());
    this.client = client;
  }

  async load() {
    const routes = new Map<string, Router>();
    const routes_path = join(process.cwd(), "dist/routes");

    for (const route_path of getFiles(routes_path)) {
      const file_path = pathToFileURL(route_path).href;
      const rel_path = relative(routes_path, route_path);
      const sections = rel_path.replace(/\\/g, "/").split("/");
      const endpoint = "/" + sections.slice(0, sections.length - 1).join("/");

      const route = (await import(file_path)).default as Route;
      const router = route(routes.get(endpoint) ?? Router(), this.client);

      routes.set(endpoint, router);
      this.app.use(endpoint, router);
    }

    for (const [endpoint] of routes) {
      console.log("Route Loaded: " + endpoint);
    }
  }
}
