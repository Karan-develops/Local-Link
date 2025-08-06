import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getFirebaseUser } from "@/lib/firebase/firebase-auth";
import {
  deleteNotice,
  getNoticeById,
  updateNotice,
} from "@/actions/notices.actions";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const paramsID = await params;
    const result = await getNoticeById(paramsID.id);

    if (!result.success) {
      const status = result.error === "Notice not found" ? 404 : 500;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in get notice API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notice" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return { success: false, error: "Unauthorized" };
    }

    const body = await request.json();

    const paramsID = await params;
    const result = await updateNotice(paramsID.id, body);

    if (!result.success) {
      const status = result.error === "Unauthorized" ? 403 : 500;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in update notice API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update notice" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getFirebaseUser();

    if (!user?.uid) {
      return { success: false, error: "Unauthorized" };
    }

    const paramsID = await params;
    const result = await deleteNotice(paramsID.id);

    if (!result.success) {
      const status = result.error === "Unauthorized" ? 403 : 500;
      return NextResponse.json(
        { success: false, error: result.error },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notice deleted successfully",
    });
  } catch (error) {
    console.error("Error in delete notice API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete notice" },
      { status: 500 }
    );
  }
}
