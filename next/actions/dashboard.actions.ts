"use server";

import { getFirebaseUser } from "@/lib/firebase/firebase-auth";
import { getTimeAgo } from "./helper.actions";
import prisma from "@/lib/prisma";

type ServerActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getDashboardStats(): Promise<ServerActionResult> {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = user.uid;

    const [
      totalNotices,
      totalUpvotes,
      totalViews,
      totalComments,
      recentNotices,
    ] = await Promise.all([
      prisma.notice.count({
        where: { userId },
      }),
      prisma.notice.aggregate({
        where: { userId },
        _sum: { upvotes: true },
      }),
      prisma.notice.aggregate({
        where: { userId },
        _sum: { views: true },
      }),
      prisma.comment.count({
        where: { notice: { userId } },
      }),
      prisma.notice.findMany({
        where: { userId },
        include: {
          _count: {
            select: {
              comments: true,
              upvotesList: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const helpfulRating =
      totalNotices > 0
        ? Math.min(
            5,
            ((totalUpvotes._sum.upvotes || 0) / totalNotices) * 0.5 + 3.5
          )
        : 0;

    const stats = {
      totalNotices,
      totalUpvotes: totalUpvotes._sum.upvotes || 0,
      totalViews: totalViews._sum.views || 0,
      totalComments,
      helpfulRating: Math.round(helpfulRating * 10) / 10,
    };

    // FIXME: Improve type any
    const formattedNotices = recentNotices.map((notice: any) => ({
      id: notice.id,
      title: notice.title,
      description: notice.description,
      category: notice.category,
      timeAgo: getTimeAgo(notice.createdAt),
      upvotes: notice._count.upvotesList,
      comments: notice._count.comments,
      views: notice.views,
      isResolved: notice.isResolved,
      status: notice.isResolved ? "resolved" : "active",
    }));

    return {
      success: true,
      data: {
        stats,
        recentNotices: formattedNotices,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard stats",
    };
  }
}
