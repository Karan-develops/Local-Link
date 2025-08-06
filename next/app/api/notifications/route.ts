import {
  getNotifications,
  markNotificationsAsRead,
} from "@/actions/notifications.actions";
import { getFirebaseUser } from "@/lib/firebase/firebase-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await getNotifications();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in notifications API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return { success: false, error: "Unauthorized" };
    }

    const body = await request.json();
    const { notificationIds, markAsRead } = body;

    const result = await markNotificationsAsRead(notificationIds, markAsRead);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notifications updated",
    });
  } catch (error) {
    console.error("Error in update notifications API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
