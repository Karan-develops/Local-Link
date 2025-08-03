import { type NextRequest, NextResponse } from "next/server";
import { getFirebaseUser } from "@/lib/firebase/firebase-auth";
import { getDashboardStats } from "@/actions/dashboard.actions";

export async function GET(request: NextRequest) {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await getDashboardStats();

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
    console.error("Error in dashboard stats API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
