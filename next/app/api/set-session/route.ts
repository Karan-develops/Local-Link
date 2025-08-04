import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { token } = await req.json();

  (await cookies()).set("__session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return new Response("Session cookie set", { status: 200 });
}
