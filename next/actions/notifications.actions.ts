"use server";

import { getFirebaseUser } from "@/lib/firebase/firebase-auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getTimeAgo } from "./helper.actions";

type ServerActionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getNotifications(): Promise<ServerActionResult> {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return { success: false, error: "Unauthorized" };
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.uid },
      include: {
        relatedNotice: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formattedNotifications = notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      relatedNotice: notification.relatedNotice,
      timeAgo: getTimeAgo(notification.createdAt),
      createdAt: notification.createdAt,
    }));

    return {
      success: true,
      data: formattedNotifications,
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      success: false,
      error: "Failed to fetch notifications",
    };
  }
}

export async function markNotificationsAsRead(
  notificationIds: string[],
  markAsRead: boolean
): Promise<ServerActionResult> {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: user.uid,
      },
      data: {
        isRead: markAsRead,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating notifications:", error);
    return {
      success: false,
      error: "Failed to update notifications",
    };
  }
}
