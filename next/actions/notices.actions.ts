"use server";

import { getFirebaseUser } from "@/lib/firebase/firebase-auth";
import prisma from "@/lib/prisma";
import { filterNoticesByRadius } from "@/utils/distance";
import { Category } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getTimeAgo } from "./helper.actions";
import { Notice } from "@/types/types";

export async function getNotices(params: {
  lat?: number;
  lng?: number;
  radius?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  limit?: number;
}) {
  try {
    const {
      lat,
      lng,
      radius = 10,
      category,
      search,
      sortBy = "recent",
    } = params;

    const where: any = {};

    if (category && category !== "all") {
      where.category = category.toUpperCase();
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    let notices = await prisma.notice.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
          },
        },
        _count: {
          select: {
            comments: true,
            upvotesList: true,
          },
        },
      },
      orderBy:
        sortBy === "popular" ? { upvotes: "desc" } : { createdAt: "desc" },
    });

    if (lat && lng) {
      notices = filterNoticesByRadius(notices, lat, lng, radius);
    }

    // FIXME: Improve type any
    const formattedNotices = notices.map((notice: any) => ({
      id: notice.id,
      title: notice.title,
      description: notice.description,
      category: notice.category,
      latitude: notice.latitude,
      longitude: notice.longitude,
      author: notice.isAnonymous ? "Anonymous" : notice.user.displayName,
      authorAvatar: notice.isAnonymous ? null : notice.user.photoUrl,
      timeAgo: getTimeAgo(notice.createdAt),
      location: notice.address,
      distance: notice.distance ? `${notice.distance.toFixed(1)} km` : null,
      upvotes: notice._count.upvotesList,
      comments: notice._count.comments,
      views: notice.views,
      isAnonymous: notice.isAnonymous,
      isResolved: notice.isResolved,
      imageUrl: notice.imageUrl,
      createdAt: notice.createdAt,
    }));

    return {
      success: true,
      data: formattedNotices,
      total: formattedNotices.length,
    };
  } catch (error) {
    console.error("Error fetching notices:", error);
    return { success: false, error: "Failed to fetch notices" };
  }
}

export async function createNotice(formData: FormData) {
  try {
    const user = await getFirebaseUser();
    if (!user?.uid) return { error: "Unauthorized" };

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const latitude = Number.parseFloat(formData.get("latitude") as string);
    const longitude = Number.parseFloat(formData.get("longitude") as string);
    const address = formData.get("address") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const isAnonymous = formData.get("isAnonymous") === "true";
    const expiresAt = formData.get("expiresAt") as string;

    const notice = await prisma.notice.create({
      data: {
        title,
        description,
        category: category.replace("-", "_").toUpperCase() as Category,
        userId: user.uid,
        latitude,
        longitude,
        address,
        imageUrl: imageUrl || null,
        isAnonymous: isAnonymous || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
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

    // TODO: Create notifications for nearby users

    revalidatePath("/notices");
    revalidatePath("/map");
    revalidatePath("/");

    return {
      success: true,
      data: notice,
    };
  } catch (error) {
    console.error("Error creating notice:", error);
    return { success: false, error: "Failed to create notice" };
  }
}

export async function updateNotice(noticeId: string, data: any) {
  try {
    const user = await getFirebaseUser();
    if (!user?.uid) return { error: "Unauthorized" };

    // Checking if user owns the notice
    const existingNotice = await prisma.notice.findUnique({
      where: { id: noticeId },
    });

    if (!existingNotice || existingNotice.userId !== user.uid) {
      return { success: false, error: "Unauthorized" };
    }

    const updatedNotice = await prisma.notice.update({
      where: { id: noticeId },
      data,
    });

    revalidatePath("/notices");
    revalidatePath("/map");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: updatedNotice,
    };
  } catch (error) {
    console.error("Error updating notice:", error);
    return { success: false, error: "Failed to update notice" };
  }
}

export async function deleteNotice(noticeId: string) {
  try {
    const user = await getFirebaseUser();
    if (!user?.uid) return { error: "Unauthorized" };

    // Checking if user owns the notice
    const existingNotice = await prisma.notice.findUnique({
      where: { id: noticeId },
    });

    if (!existingNotice || existingNotice.userId !== user.uid) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notice.delete({
      where: { id: noticeId },
    });

    revalidatePath("/notices");
    revalidatePath("/map");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Notice deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting notice:", error);
    return { success: false, error: "Failed to delete notice" };
  }
}

export async function toggleUpvote(noticeId: string) {
  try {
    const user = await getFirebaseUser();
    if (!user?.uid) return { error: "Unauthorized" };

    const userId = user.uid;

    const existingUpvote = await prisma.upvote.findUnique({
      where: {
        unique_upvote: {
          noticeId,
          userId,
        },
      },
    });

    if (existingUpvote) {
      await prisma.upvote.delete({
        where: { id: existingUpvote.id },
      });

      await prisma.notice.update({
        where: { id: noticeId },
        data: { upvotes: { decrement: 1 } },
      });

      revalidatePath("/notices");
      revalidatePath("/map");

      return {
        success: true,
        data: { action: "removed" },
      };
    } else {
      await prisma.upvote.create({
        data: {
          noticeId,
          userId,
        },
      });

      await prisma.notice.update({
        where: { id: noticeId },
        data: { upvotes: { increment: 1 } },
      });

      const notice = await prisma.notice.findUnique({
        where: { id: noticeId },
        select: { userId: true, title: true },
      });

      if (notice && notice.userId !== userId) {
        await prisma.notification.create({
          data: {
            userId: notice.userId,
            title: "Someone upvoted your notice",
            message: `Your notice "${notice.title}" received an upvote`,
            type: "UPVOTE",
            relatedNoticeId: noticeId,
          },
        });
      }

      revalidatePath("/notices");
      revalidatePath("/map");

      return {
        success: true,
        data: { action: "added" },
      };
    }
  } catch (error) {
    console.error("Error handling upvote:", error);
    return {
      success: false,
      error: "Failed to handle upvote",
    };
  }
}

export async function getNoticeById(noticeId: string) {
  try {
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            photoUrl: true,
          },
        },
        comments: {
          select: { id: true },
        },
        _count: {
          select: {
            upvotesList: true,
          },
        },
      },
    });

    if (!notice) {
      return {
        success: false,
        error: "Notice not found",
      };
    }

    await prisma.notice.update({
      where: { id: noticeId },
      data: { views: { increment: 1 } },
    });

    const transformedNotice: Notice = {
      id: notice.id,
      title: notice.title,
      description: notice.description,
      category: notice.category,
      timeAgo: getTimeAgo(notice.createdAt),
      upvotes: notice._count.upvotesList,
      views: notice.views + 1,
      comments: notice.comments.length,
      author: notice.isAnonymous
        ? "Anonymous"
        : notice.user.displayName ?? "Unknown",
      authorAvatar: notice.isAnonymous
        ? undefined
        : notice.user.photoUrl ?? undefined,
      isAnonymous: notice.isAnonymous,
      imageUrl: notice.imageUrl ?? undefined,
      distance: "0Km",
      isResolved: notice.isResolved,
      hasUpVoted: false,
    };

    return {
      success: true,
      data: transformedNotice,
    };
  } catch (error) {
    console.error("Error fetching notice:", error);
    return {
      success: false,
      error: "Failed to fetch notice",
    };
  }
}

export async function getCategoryCounts() {
  try {
    const counts = await prisma.notice.groupBy({
      by: ["category"],
      _count: {
        id: true,
      },
    });

    const total = await prisma.notice.count();

    const categories: Record<string, number> = {};
    counts.forEach((count) => {
      categories[count.category] = count._count.id;
    });

    return {
      success: true,
      data: { categories, total },
    };
  } catch (error) {
    console.error("Error fetching category counts:", error);
    return { success: false, error: "Failed to fetch category counts" };
  }
}
