import { MapView } from "@/components/MapView";
import Navbar from "@/components/Navbar";

export default function MapPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-8">
        <MapView />
      </main>
    </div>
  );
}
