import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/firebase-admin";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Missing token" },
        { status: 401 }
      );
    }

    const decoded = await adminAuth.verifyIdToken(token);

    const existingUser = await prisma.user.findUnique({
      where: { id: decoded.uid },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: decoded.uid,
          email: decoded.email || "",
          displayName: decoded.name || "",
          photoUrl: decoded.picture || "",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error creating user:", err);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}
