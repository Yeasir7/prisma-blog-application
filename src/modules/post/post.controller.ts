import { NextFunction, Request, Response } from "express";
import { postServices } from "./post.services";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationAndSortingHelper from "../../helper/paginationAndSortingHelper";
import { userRole } from "../../middleware/auth";

const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await postServices.createPost(
      req.body,
      req.user?.id as string,
    );
    res.status(201).json(result);
  } catch (err: any) {
    next(err)
  }
};

const getAllPost = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
          ? false
          : undefined
      : undefined;

    const status = req.query.status as PostStatus | undefined;
    const authorId = req.query.authorId as string;

    const { page, skip, limit, sortBy, sortOrder } = paginationAndSortingHelper(
      req.query,
    );

    const result = await postServices.getAllPost({
      search,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      skip,
      limit,
      sortBy,
      sortOrder,
    });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      err: err.message,
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const result = await postServices.getPostById(req.params.id as string);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      err: err.message,
    });
  }
};

const getPostByAuthorId = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("you are not user");
    }
    const result = await postServices.getPostByAuthorId(user.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      err: err.message,
    });
  }
};

const updatePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("you are not authorized");
    }
    const isAdmin = user.role === userRole.admin;
    const result = await postServices.updatePost(
      req.params.id as string,
      req.body,
      user.id,
      isAdmin,
    );
    res.status(200).json(result);
  } catch (err: any) {
   next(err)
  }
};

const deletePost = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("you are not authorized");
    }
    const isAdmin = user.role === userRole.admin;
    const result = await postServices.deletePost(
      req.params.id as string,
      user.id,
      isAdmin,
    );
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      err: err.message,
    });
  }
};

const getStats = async (req: Request, res: Response) => {
  try {
    const result = await postServices.getStats();
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      err: err.message,
    });
  }
};

export const postController = {
  createPost,
  getAllPost,
  getPostById,
  getPostByAuthorId,
  updatePost,
  deletePost,
  getStats,
};
