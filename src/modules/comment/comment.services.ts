import { CommentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createComment = async (payLoad: {
  content: string;
  authorId: string;
  postId: string;
  parentId?: string;
}) => {
  await prisma.post.findUniqueOrThrow({
    where: {
      id: payLoad.postId,
    },
  });
  if (payLoad.parentId) {
    await prisma.comment.findUniqueOrThrow({
      where: {
        id: payLoad.parentId,
      },
    });
  }
  const result = await prisma.comment.create({
    data: payLoad,
  });
  return result;
};

const getCommentById = async(id: string)=>{
 return await prisma.comment.findUnique({
    where: {
        id 
    },
    include:{
        post: {
            select : {
                title: true,
                content: true
            }
        }
    }
 })
}

const getCommentByAuthorId = async(id: string)=>{
    return await prisma.comment.findMany({
        where:{
            authorId: id
        },
        orderBy: {
            createdAt : "desc"
        },
        include:{
            post:{
                select: {
                    title: true,
                    content: true
                }
            }
        }
    })
}

const deleteComment = async(commentId: string, authorId: string)=>{
    const commentData = await prisma.comment.findFirst({
        where:{
            id: commentId,
            authorId
        }
    })

    if(!commentData){
        throw new Error("Your provided input is invalid")
    }

    return await prisma.comment.delete({
        where:{
            id : commentData.id
        }
    })
}

// updatedData, commentId, authorId
const updateComment = async (
  commentId: string,
  data: { content: string; status: CommentStatus},
  authorId: string,
) => {
    const commentData = await prisma.comment.findFirst({
      where: {
        id: commentId,
        authorId,
      },
    });

    if (!commentData) {
      throw new Error("Your provided input is invalid");
    }

    return await prisma.comment.update({
        where:{
            id: commentId,
            authorId
        },
        data
    })
};

const moderateComment = async(id: string, data: { status: CommentStatus}) =>{
    const commentData = await prisma.comment.findUniqueOrThrow({
        where:{
            id
        },
        select:{
            id: true,
            status: true
        }
    })

    if(commentData.status === data.status){
        throw new Error(`Your provided status (${data.status}) is already up to date`)
    }

    return await prisma.comment.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        status: true,
      },
    });
}



export const commentServices = {
  createComment,
  getCommentById,
  getCommentByAuthorId,
  deleteComment,
  updateComment,
  moderateComment,
  
};
