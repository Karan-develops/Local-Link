"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getFirebaseUser } from "@/lib/firebase/firebase-auth";

type ServerActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export async function createComment(
  formData: FormData
): Promise<ServerActionResult> {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return { success: false, error: "Unauthorized" };
    }

    const noticeId = formData.get("noticeId") as string;
    const content = formData.get("content") as string;
    const isAnonymous = formData.get("isAnonymous") === "true";

    const comment = await prisma.comment.create({
      data: {
        noticeId,
        userId: user.uid,
        content,
        isAnonymous,
      },
      include: {
        user: {
          select: {
            displayName: true,
            photoUrl: true,
          },
        },
      },
    });

    const notice = await prisma.notice.findUnique({
      where: { id: noticeId },
      select: { userId: true, title: true },
    });

    if (notice && notice.userId !== user.uid) {
      await prisma.notification.create({
        data: {
          userId: notice.userId,
          title: "New comment on your notice",
          message: `Someone commented on "${notice.title}"`,
          type: "COMMENT",
          relatedNoticeId: noticeId,
        },
      });
    }

    revalidatePath("/notices");
    revalidatePath(`/notices/${noticeId}`);

    return {
      success: true,
      data: {
        ...comment,
        createdAt: comment.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      success: false,
      error: "Failed to create comment",
    };
  }
}

export async function getComments(
  noticeId: string
): Promise<ServerActionResult> {
  try {
    const comments = await prisma.comment.findMany({
      where: { noticeId },
      include: {
        user: {
          select: {
            displayName: true,
            photoUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedComments = comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: formattedComments,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      success: false,
      error: "Failed to fetch comments",
    };
  }
}

export async function deleteComment(
  commentId: string
): Promise<ServerActionResult> {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return { success: false, error: "Unauthorized" };
    }

    // Checking if user owns the comment
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment || existingComment.userId !== user.uid) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    revalidatePath("/notices");
    revalidatePath(`/notices/${existingComment.noticeId}`);

    return {
      success: true,
      message: "Comment deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return {
      success: false,
      error: "Failed to delete comment",
    };
  }
}
