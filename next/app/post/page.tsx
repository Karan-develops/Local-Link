import Navbar from "@/components/Navbar";
import { PostNoticeForm } from "@/components/PostNoticeForm";

export default function PostNoticePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
                Post a Notice
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Share important information with your local community
              </p>
            </div>
            <PostNoticeForm />
          </div>
        </div>
      </main>
    </div>
  );
}
