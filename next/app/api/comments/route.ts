import { createComment } from "@/actions/comments.actions";
import { getFirebaseUser } from "@/lib/firebase/firebase-auth";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { noticeId, content, isAnonymous } = body;

    const formData = new FormData();
    formData.append("noticeId", noticeId);
    formData.append("content", content);
    if (isAnonymous) {
      formData.append("isAnonymous", "true");
    }

    const result = await createComment(formData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in create comment API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create comment" },
      { status: 500 }
    );
  }
}
