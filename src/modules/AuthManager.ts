import { Request, Response, NextFunction } from "express";
import JWT from "jsonwebtoken";
import { AuthData, AuthPayload } from "../structures/Auth.js";

const _sessions = new Map<string, string>();

function _generateToken(session_id: string): AuthData {
  // create payload
  const payload = { pld: { id: session_id } as AuthData } as AuthPayload;

  // generate token
  const access_token = JWT.sign(payload, process.env.JWT_ACCESS!, {
    issuer: "JKLorenzoPBAPI",
    subject: "access",
    expiresIn: "10m",
  });

  // add token to sessions
  _sessions.set(session_id, access_token);

  // return token
  return { token: access_token };
}

export default class AuthManager {
  static authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const auth_header = req.headers.authorization;
      const token = auth_header && auth_header.split(" ")[1];
      if (!token) return res.sendStatus(401);

      // verify token
      const payload = JWT.verify(token, process.env.JWT_ACCESS!, {
        issuer: "JKLorenzoPBAPI",
        subject: "access",
      }) as AuthPayload;

      // check if session id is registered
      if (!payload.pld?.id || !_sessions.has(payload.pld.id)) {
        return res.sendStatus(403);
      }

      // continue
      next();
    } catch (error) {
      console.error(error);
      return res.sendStatus(403);
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const auth_header = req.headers.authorization;
      const token = auth_header && auth_header.split(" ")[1];
      const session_id = req.body.id;
      if (!token) return res.sendStatus(401);

      // verify token
      const payload = JWT.verify(token, process.env.JWT_REGISTER!, {
        algorithms: ["HS256"],
        issuer: "JKLorenzoPBAPP",
        subject: "register",
      }) as AuthPayload;

      // check if session id matches the payload
      if (!payload.pld?.id || payload.pld.id !== session_id) {
        return res.sendStatus(403);
      }

      // generate access token
      const data = _generateToken(session_id);

      // send token
      await res.json(data);
    } catch (error) {
      console.error(error);
      return res.sendStatus(403);
    }
  }
}
