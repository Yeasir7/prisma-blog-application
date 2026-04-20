import { Request, Response } from "express";
import { commentServices } from "./comment.services";

const createComment = async(req: Request, res: Response) =>{
    try{
        req.body.authorId = req.user?.id
        const result = await commentServices.createComment(req.body)
        res.status(200).json(result)
    }catch(err : any){
        res.status(400).json({
            err: err.message
        })
    }
}
const getCommentById = async(req: Request, res: Response) =>{
    try{
        const result = await commentServices.getCommentById(
          req.params.id as string,
        );
        res.status(200).json(result)
    }catch(err : any){
        res.status(400).json({
            err: err.message
        })
    }
}
const getCommentByAuthorId = async (req: Request, res: Response) => {
  try {
    const result = await commentServices.getCommentByAuthorId(
      req.params.id as string,
    );
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      err: err.message,
    });
  }
};
const deleteComment = async (req: Request, res: Response) => {
  try {
    const result = await commentServices.deleteComment(req.params.commentId as string, req.user?.id as string);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      err: err.message,
    });
  }
};
const updateComment = async (req: Request, res: Response) => {
  try {
    const result = await commentServices.updateComment(req.params.commentId as string, req.body,req.user?.id as string);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({
      err: err.message,
    });
  }
};

const moderateComment = async(req: Request, res: Response) =>{
    try{
        const result = await commentServices.moderateComment(
          req.params.commentId as string, req.body
        );
    res.status(200).json(result)
    }catch(err: any){
        res.status(400).json({
            err: err.message
        })
    }
}






export const commentController = {
  createComment,
  getCommentById,
  getCommentByAuthorId,
  deleteComment,
  updateComment,
  moderateComment,
  
};
