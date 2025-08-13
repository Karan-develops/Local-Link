import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { uuidv4 } from "zod";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        folder: "notices",
        public_id: `${uuidv4()}-${file.name}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error || !result) throw error;
      }
    );

    const streamUpload = () =>
      new Promise<any>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "notices",
            public_id: `${uuidv4()}-${file.name}`,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(buffer);
      });

    const result = await streamUpload();

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
