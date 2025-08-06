"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getFirebaseUser } from "@/lib/firebase/firebase-auth";

export async function createComment(formData: FormData) {
  try {
    const user = await getFirebaseUser();
    if (!user?.uid) return { error: "Unauthorized" };

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
      data: comment,
    };
  } catch (error) {
    console.error("Error creating comment:", error);
    return {
      success: false,
      error: "Failed to create comment",
    };
  }
}

export async function getComments(noticeId: string) {
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

    return {
      success: true,
      data: comments,
    };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return {
      success: false,
      error: "Failed to fetch comments",
    };
  }
}
