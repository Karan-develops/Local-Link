import { getAuth } from "firebase/auth";

export async function setFirebaseSessionCookie() {
  const user = getAuth().currentUser;
  if (!user) return;

  const token = await user.getIdToken();

  await fetch("/api/set-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
}
