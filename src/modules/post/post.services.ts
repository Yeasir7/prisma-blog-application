import { promise, Status } from "better-auth";
import {
  CommentStatus,
  Post,
  PostStatus,
} from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { userRole } from "../../middleware/auth";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  userId: string,
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: userId,
    },
  });
  return result;
};

const getAllPost = async (payLoad: {
  search: string | undefined;
  tags: string[];
  isFeatured: boolean | undefined;
  status: PostStatus | undefined;
  authorId: string | undefined;
  page: number;
  skip: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
}) => {
  const {
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
  } = payLoad;

  const andCondition: PostWhereInput[] = [];

  if (search) {
    andCondition.push({
      OR: [
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search as string,
          },
        },
      ],
    });
  }

  if (tags.length > 0) {
    andCondition.push({
      tags: {
        hasEvery: tags,
      },
    });
  }

  if (typeof isFeatured === "boolean") {
    andCondition.push({
      isFeatured,
    });
  }

  if (status) {
    andCondition.push({
      status,
    });
  }
  if (authorId) {
    andCondition.push({
      authorId,
    });
  }

  const result = await prisma.post.findMany({
    take: limit,
    skip,
    where: {
      AND: andCondition,
    },
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      _count: {
        select: {
          comment: true,
        },
      },
    },
  });

  const total = await prisma.post.count({
    where: {
      AND: andCondition,
    },
  });

  return {
    data: result,
    pagination: {
      total,
      page,
      limit,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getPostById = async (postId: string) => {
  const result = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    const dataById = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        comment: {
          where: {
            status: CommentStatus.APPROVED,
            parentId: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            replies: {
              where: {
                status: CommentStatus.APPROVED,
              },
              orderBy: {
                createdAt: "asc",
              },
              include: {
                replies: {
                  where: {
                    status: CommentStatus.APPROVED,
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            comment: true,
          },
        },
      },
    });
    return dataById;
  });
  return result;
};

const getPostByAuthorId = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: {
      authorId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          comment: true,
        },
      },
    },
  });

  // const total = await prisma.post.count({
  //   where:{
  //     authorId
  //   }
  // })
  return result;
};

const updatePost = async (
  postId: string,
  data: Partial<Post>,
  authorId: string,
  isAdmin: boolean,
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });
  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("You are not owner of this post");
  }

  if (!isAdmin) {
    delete data.isFeatured;
  }

  return prisma.post.update({
    where: {
      id: postId,
    },
    data,
  });
};

/*
 1/ user can delete his own post
 2/ admin can delete any post
*/
const deletePost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const postData = await prisma.post.findUniqueOrThrow({
    where: {
      id: postId,
    },
    select: {
      id: true,
      authorId: true,
    },
  });
  if (!isAdmin && postData.authorId !== authorId) {
    throw new Error("you are not author of this post");
  }

  return await prisma.post.delete({
    where: {
      id: postId,
    },
  });
};

/**
 * GET STATUS
 * post count, published post, draftPost, totalComment, totalView
 */

const getStats = async () => {
  return await prisma.$transaction(async (tx) => {
    const [postCount, publishedPost, draftPost, archivedPost, commentCount, approvedComment, totalUser, adminCount, userCount, totalViewCount] =
      await Promise.all([
        tx.post.count(),
        tx.post.count({
          where: {
            status: PostStatus.PUBLISHED,
          },
        }),
        tx.post.count({
          where: {
            status: PostStatus.DRAFT,
          },
        }),
        tx.post.count({
          where: {
            status: PostStatus.ARCHIVED,
          },
        }),
        tx.comment.count(),
        tx.comment.count({
          where:{
            status: CommentStatus.APPROVED
          }
        }),
        tx.user.count(),
        tx.user.count({
          where:{
            role: userRole.admin
          }
        }),
        tx.user.count({
          where:{
            role: userRole.user
          }
        }),
        tx.post.aggregate({
          _sum:{
            views: true
          }
        })
      ]);

    return {
      postCount,
      publishedPost,
      draftPost,
      archivedPost,
      commentCount,
      approvedComment,
      totalUser,
      adminCount,
      userCount,
      totalViewCount : totalViewCount._sum.views,
    };
  });
};

export const postServices = {
  createPost,
  getAllPost,
  getPostById,
  getPostByAuthorId,
  updatePost,
  deletePost,
  getStats,
};
