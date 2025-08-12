"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getFirebaseUser } from "@/lib/firebase/firebase-auth";

export interface ServerActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  action?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  location: string | null;
  joinedAt: Date;
  isVerified: boolean;
  stats: {
    totalNotices: number;
    totalUpvotes: number;
    totalComments: number;
    helpfulVotes: number;
  };
  badges: string[];
  recentActivity: any[];
}

export async function getUserProfile(
  userId?: string
): Promise<ServerActionResult<UserProfile>> {
  try {
    const firebaseUser = await getFirebaseUser();
    if (!firebaseUser?.uid) return { success: false, error: "Unauthorized" };

    const targetUserId = userId || firebaseUser?.uid;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        notices: {
          include: {
            _count: {
              select: {
                upvotesList: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        comments: {
          include: {
            notice: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            notices: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const helpfulVotes = user.notices.reduce(
      (sum, notice) => sum + notice._count.upvotesList,
      0
    );

    const badges = [];
    if (user._count.notices >= 10) badges.push("Active Contributor");
    if (helpfulVotes >= 50) badges.push("Community Helper");
    if (user._count.comments >= 25) badges.push("Engaged Member");
    if (user.isVerified) badges.push("Verified User");

    const recentActivity = [
      ...user.notices.map((notice) => ({
        type: "notice",
        id: notice.id,
        title: notice.title,
        createdAt: notice.createdAt,
        upvotes: notice._count.upvotesList,
        comments: notice._count.comments,
      })),
      ...user.comments.map((comment) => ({
        type: "comment",
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        notice: comment.notice,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    const profile: UserProfile = {
      id: user.id,
      email: user.email || "",
      displayName: user.displayName || "User",
      photoUrl: user.photoUrl,
      location: user.location,
      joinedAt: user.createdAt,
      isVerified: user.isVerified,
      stats: {
        totalNotices: user._count.notices,
        totalUpvotes: helpfulVotes,
        totalComments: user._count.comments,
        helpfulVotes,
      },
      badges,
      recentActivity,
    };

    return { success: true, data: profile };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: "Failed to fetch user profile" };
  }
}

export async function updateUserProfile(
  formData: FormData
): Promise<ServerActionResult> {
  try {
    const firebaseUser = await getFirebaseUser();
    if (!firebaseUser?.uid) return { success: false, error: "Unauthorized" };

    const displayName = formData.get("displayName") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;

    await prisma.user.update({
      where: { id: firebaseUser.uid },
      data: {
        displayName: displayName || null,
        location: location || "",
      },
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function followUser(userId: string): Promise<ServerActionResult> {
  try {
    const firebaseUser = await getFirebaseUser();
    if (!firebaseUser?.uid) return { success: false, error: "Unauthorized" };

    if (firebaseUser.uid === userId) {
      return { success: false, error: "Cannot follow yourself" };
    }

    // Check if already following
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        unique_follow: {
          followerId: firebaseUser.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.userFollow.delete({
        where: { id: existingFollow.id },
      });

      return {
        success: true,
        message: "Unfollowed user",
        action: "unfollowed",
      };
    } else {
      // Follow
      await prisma.userFollow.create({
        data: {
          followerId: firebaseUser.uid,
          followingId: userId,
        },
      });

      await prisma.notification.create({
        data: {
          userId: userId,
          title: "New Follower",
          message: `${firebaseUser.uid || "Someone"} started following you`,
          type: "FOLLOW",
        },
      });

      return { success: true, message: "Following user", action: "followed" };
    }
  } catch (error) {
    console.error("Error following user:", error);
    return { success: false, error: "Failed to follow user" };
  }
}
