import { DashboardView } from "@/components/DashboardView";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-8">
        <DashboardView />
      </main>
    </div>
  );
}
