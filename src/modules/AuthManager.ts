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

      // check if token is registered
      if (_sessions.get(payload.pld.id) !== token) {
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

    // sweep session after 15 mins
    setTimeout(() => {
      // check if this session still exists
      if (data.id && _sessions.has(data.id)) {
        // check if session has the same token
        if (_sessions.get(data.id) === data.token) {
          // delete session
          _sessions.delete(data.id);
        }
      }
    }, 600000);

    // encapsulate access token
    const encapsulated_payload = {
      pld: { id: data.id, token: access_token } as AuthData,
    } as AuthPayload;

    // encode using register token
    const encoded_token = JWT.sign(
      encapsulated_payload,
      process.env.JWT_REGISTER!,
      {
        algorithm: "HS256",
        issuer: "JKLorenzoPBAPI",
        subject: "registered",
        expiresIn: "30s",
      }
    );

    // return encoded data
    return { id: data.id, token: encoded_token };
  }
}
