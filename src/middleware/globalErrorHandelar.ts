import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(err);
  }
  let statsCode = 500;
  let errorMassage = "Internal Server Error";
  let errorDetails = err;

  if (err instanceof Prisma.PrismaClientValidationError) {
    statsCode = 400;
    errorMassage = "You provided incorrect field type or missing field";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      ((statsCode = 400),
        (errorMassage =
          "An operation failed because it depends on one or more records that were required but not found. "));
    } else if (err.code === "P2002") {
      ((statsCode = 400), (errorMassage = "Unique constraint failed"));
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statsCode = 500;
    errorMassage =
      "Sorry! Something went wrong on our end, please try again later";
  }
  else if(err instanceof Prisma.PrismaClientRustPanicError) {
    ((statsCode = 400),
      (errorMassage =
        "Sorry! Something went wrong on our end, please try again later"));
  }
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    if(err.errorCode = "p1000"){
        statsCode = 401,
        errorMassage = "please check your credential"
    }
  }
  res.status(statsCode);
  res.json({
    message: errorMassage,
    error: errorDetails,
  });
}

export default errorHandler;
