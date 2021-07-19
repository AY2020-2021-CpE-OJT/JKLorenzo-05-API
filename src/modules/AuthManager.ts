import { Request, Response, NextFunction } from "express";
import JWT from "jsonwebtoken";
import AuthData from "../structures/AuthData.js";
import AuthPayload from "../structures/AuthPayload.js";

const _sessions = new Map<string, string>();

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

  static verifyRegisterToken(token: string, data: AuthData) {
    // verify token
    const payload = JWT.verify(token, process.env.JWT_REGISTER!, {
      algorithms: ["HS256"],
      issuer: "JKLorenzoPBAPP",
      subject: "register",
    }) as AuthPayload;

    // check if token matches the request body
    if (!payload.pld || payload.pld.id !== data.id || token !== data.token) {
      throw new Error("SESSION_MISMATCH");
    }
  }

  static authenticateSession(data: AuthData): AuthData {
    // check if session id is invalid
    if (!data.id) throw new Error("INVALID_SESSION_ID");

    // create payload
    const payload = { pld: data } as AuthPayload;

    // generate token
    const access_token = JWT.sign(payload, process.env.JWT_ACCESS!, {
      issuer: "JKLorenzoPBAPI",
      subject: "access",
      expiresIn: "10m",
    });

    // add token to sessions
    _sessions.set(data.id, access_token);

    // encapsulate access token
    const enapsulated_payload = {
      pld: { id: data.id, token: access_token } as AuthData,
    } as AuthPayload;

    // encode using register token
    const encoded_token = JWT.sign(
      enapsulated_payload,
      process.env.JWT_REGISTER!,
      {
        issuer: "JKLorenzoPBAPI",
        subject: "registered",
        expiresIn: "10m",
      }
    );

    // return encoded data
    return { id: data.id, token: encoded_token };
  }
}
