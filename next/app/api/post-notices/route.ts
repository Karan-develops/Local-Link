import { NextRequest, NextResponse } from "next/server";
import { createNotice } from "@/actions/notices.actions";
import { getFirebaseUser } from "@/lib/firebase/firebase-auth";

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

    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    const result = await createNotice(formData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in create notice API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create notice" },
      { status: 500 }
    );
  }
}
