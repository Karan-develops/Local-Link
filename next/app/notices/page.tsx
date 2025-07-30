import Navbar from "@/components/Navbar";
import { NoticesView } from "@/components/NoticesView";

export default function NoticesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-8">
        <NoticesView />
      </main>
    </div>
  );
}
