import express, { Router } from "express"
import { commentController } from "./comment.controller"
import auth, { userRole } from "../../middleware/auth"

const router = Router()

router.post("/",auth(userRole.admin, userRole.user),  commentController.createComment)

router.get("/:id", commentController.getCommentById)
router.get("/author/:id", commentController.getCommentByAuthorId);


router.patch(
  "/:commentId",
  auth(userRole.admin, userRole.user),
  commentController.updateComment,
);

router.patch(
  "/:commentId/moderate",
  auth(userRole.admin),
  commentController.moderateComment,
);

export const commentRouter = router