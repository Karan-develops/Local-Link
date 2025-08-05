import { auth } from "@/lib/firebase/firebase";
import { onIdTokenChanged } from "firebase/auth";

export function watchAndRefreshSession() {
  onIdTokenChanged(auth, async (user) => {
    if (!user) return;

    const token = await user.getIdToken();

    await fetch("/api/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  });
}
