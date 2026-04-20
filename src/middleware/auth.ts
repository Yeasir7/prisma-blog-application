import { NextFunction, Request, Response } from "express";
import {auth as betterAuth} from "../lib/auth"
import { includes } from "better-auth";

export enum userRole {
  user = "USER",
  admin = "ADMIN",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        emailVerified: boolean;
      };
    }
  }
}

const auth = (...roles: userRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // console.log(req.headers);
    const session = await betterAuth.api.getSession({
      headers: req.headers as any,
    });

    if (!session) {
      res.status(401).json({
        success: false,
        message: "you are not authorized",
      });
    }
    if (!session?.user.emailVerified) {
      res.status(403).json({
        success: false,
        message: "Email verification needed",
      });
    }
    req.user = {
      id: session?.user.id as string,
      email: session?.user.email as string,
      name: session?.user.name as string,
      role: session?.user.role as string,
      emailVerified: session?.user.emailVerified as boolean,
    };

    if (!roles.length && !includes(req.user.role as userRole)) {
      res.status(403).json({
        success: false,
        message: "you don't have access to this resources",
      });
    }
    next();
  };
};

export default auth