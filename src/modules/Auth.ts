import { Request, Response, NextFunction } from "express";
import JWT from "jsonwebtoken";
import AuthData from "../structures/AuthData.js";
import AuthPayload from "../structures/AuthPayload.js";

const _sessions = new Map<string, string>();
const _access_secret = process.env.JWT_ACCESS!;
const _register_secret = process.env.JWT_REGISTER!;

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const auth_header = req.headers.authorization;
    const token = auth_header && auth_header.split(" ")[1];
    if (!token) return res.sendStatus(401);

    // verify token
    const payload = JWT.verify(token, _access_secret, {
      issuer: "JKLorenzoPBAPI",
      subject: "access",
    }) as AuthPayload;

    // check if session id is registered
    if (!payload.pld?.id || !_sessions.has(payload.pld.id)) {
      return res.sendStatus(401);
    }

    // check if token is registered
    if (_sessions.get(payload.pld.id) !== token) {
      return res.sendStatus(401);
    }

    // continue
    next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(401);
  }
}

export function isValidAuthReq(token: string, data?: AuthData): boolean {
  try {
    // check data
    if (!data?.id) return false;
    if (!data?.token) return false;

    // verify token
    const payload = JWT.verify(token, _register_secret, {
      algorithms: ["HS256"],
      issuer: "JKLorenzoPBAPP",
      subject: "register",
    }) as AuthPayload;

    // check if token matches the request body
    if (!payload.pld || payload.pld.id !== data.id || token !== data.token) {
      return false;
    }

    return true;
  } catch (_) {
    return false;
  }
}

export function authorize(data: AuthData): AuthData {
  // check if session id is invalid
  if (!data.id) throw "INVALID_SESSION_ID";
  if (!data.token) throw "INVALID_SESSION_TOKEN";

  // create payload
  const payload = {
    pld: { id: data.id, token: data.token } as AuthData,
  } as AuthPayload;

  // generate token
  const access_token = JWT.sign(payload, _access_secret, {
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
  const encoded_token = JWT.sign(encapsulated_payload, _register_secret, {
    algorithm: "HS256",
    issuer: "JKLorenzoPBAPI",
    subject: "registered",
    expiresIn: "30s",
  });

  // return encoded data
  return { id: data.id, token: encoded_token };
}
