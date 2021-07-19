import { Router } from "express";
import { MongoClient } from "mongodb";
import AuthData from "../../../structures/AuthData.js";
import AuthManager from "../../../modules/AuthManager.js";

export default function (router: Router, client: MongoClient): Router {
  return router.post("/", (req, res) => {
    console.log("auth/register post");
    try {
      const auth_header = req.headers.authorization;
      const register_token = auth_header && auth_header.split(" ")[1];
      const register_data = req.body as AuthData;
      if (!register_token) return res.sendStatus(401);

      // verify register request
      AuthManager.verifyRegisterToken(register_token, register_data);

      // authenticate session
      const encoded_data = AuthManager.authenticateSession(register_data);

      // send encoded data
      res.json(encoded_data);
    } catch (error) {
      console.error(error);
      res.sendStatus(403);
    }
  });
}
