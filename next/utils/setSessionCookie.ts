import { getAuth } from "firebase/auth";

export async function setFirebaseSessionCookie() {
  const user = getAuth().currentUser;
  if (!user) return;

  const token = await user.getIdToken();
  document.cookie = `__session=${token}; path=/; secure; samesite=strict`;
}
