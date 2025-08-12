import Navbar from "@/components/Navbar";
import { UserProfile } from "@/components/UserProfile";

export default async function UserPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const paramsId = (await paramsPromise).id;
  return (
    <>
      <Navbar />
      <UserProfile userId={paramsId} />;
    </>
  );
}
