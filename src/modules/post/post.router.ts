import express, { NextFunction, Request, Response, Router } from "express";
import { postController } from "./post.controller";
import auth, { userRole } from "../../middleware/auth";

const router = Router();

router.post("/", auth(userRole.user), postController.createPost);

router.get("/", postController.getAllPost);
router.get("/stats", auth(userRole.admin), postController.getStats);
router.get(
  "/myPost",
  auth(userRole.admin, userRole.user),
  postController.getPostByAuthorId,
);
router.get("/:id", postController.getPostById);

router.patch(
  "/:id",
  auth(userRole.admin, userRole.user),
  postController.updatePost,
);

router.delete(
  "/:id",
  auth(userRole.admin, userRole.user),
  postController.deletePost,
);

export const postRouter = router;
