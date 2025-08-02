import { getNotices } from "@/actions/notices.actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = Number.parseFloat(searchParams.get("lat") || "0");
    const longitude = Number.parseFloat(searchParams.get("lng") || "0");
    const radius = Number.parseInt(searchParams.get("radius") || "10");
    const category = searchParams.get("category") || "all";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "recent";

    const result = await getNotices({
      lat: latitude || undefined,
      lng: longitude || undefined,
      radius,
      category,
      search,
      sortBy: sortBy as "recent" | "popular",
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.data?.length || 0,
    });
  } catch (error) {
    console.error("Error in notices API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notices" },
      { status: 500 }
    );
  }
}
