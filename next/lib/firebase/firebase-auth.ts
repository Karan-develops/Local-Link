import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";

export async function getFirebaseUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("__session")?.value;
  if (!token) return null;

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch {
    return null;
  }
}
