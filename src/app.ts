import express from "express"
import { postRouter } from "./modules/post/post.router";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cors from "cors"
import { commentRouter } from "./modules/comment/comment.router";
import errorHandler from "./middleware/globalErrorHandelar";
import { notFound } from "./middleware/notFound";

const app = express()
app.use(
  cors({
    origin: "http://localhost:4000",
    credentials: true
  }),
);
app.use(express.json())
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.get("/", (req, res)=>{
    res.send("Hello world, I am learning prisma which is an ORM");
})
// post
app.use("/post", postRouter)
// comment
app.use("/comment", commentRouter);
app.use(notFound)
app.use(errorHandler)

export default app