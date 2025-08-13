import { toggleUpvote } from "@/actions/notices.actions";
import { getFirebaseUser } from "@/lib/firebase/firebase-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const paramsID = await params;
    const result = await toggleUpvote(paramsID.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      action: result.data?.action,
      message:
        result.data?.action === "added" ? "Upvote added" : "Upvote removed",
    });
  } catch (error) {
    console.error("Error in upvote API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to handle upvote" },
      { status: 500 }
    );
  }
}
