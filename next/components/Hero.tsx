"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Eye, MessageSquare, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCategoryCounts, getNotices } from "@/actions/notices.actions";

interface HeroStats {
  totalNotices: number;
  activeUsers: number;
  totalComments: number;
}

export function HeroSection() {
  const [stats, setStats] = useState<HeroStats>({
    totalNotices: 0,
    activeUsers: 0,
    totalComments: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);

        const countsResult = await getCategoryCounts();

        const noticesResult = await getNotices({ limit: 100 });

        if (countsResult.success && noticesResult.success) {
          const totalNotices = countsResult.data?.total || 0;

          const uniqueUsers = new Set(
            noticesResult.data?.map((notice) => notice.author) || []
          ).size;

          const totalComments =
            noticesResult.data?.reduce(
              (sum, notice) => sum + notice.comments,
              0
            ) || 0;

          setStats({
            totalNotices,
            activeUsers: uniqueUsers,
            totalComments,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          totalNotices: 0,
          activeUsers: 0,
          totalComments: 0,
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br  opacity-50" />
      <div className="absolute inset-0 opacity-5" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold dark:text-white text-gray-900 mb-6">
              Stay Updated with Your{" "}
              <span className="bg-clip-text text-orange-500">
                Local Community
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl dark:text-white text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            Your neighborhood's digital noticeboard. Post and discover local
            notices, events, and important updates happening around you.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-12 mt-32 ml-36 sm:lg-auto"
          >
            <div className="stroke-black dark:stroke-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="115" height="45">
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeMiterlimit="10"
                >
                  <path d="M108.519 35.397c-9.013 8.839-24.133 9.449-34.974 3.485-4.474-2.461-10.037-7.56-8.195-13.4.818-2.596 4.623-7.007 7.465-3.78 3.573 4.061-3.756 11.358-6.245 13.396-6.997 5.731-16.648 7.996-25.507 6.503-20.278-3.415-29.921-23.09-37.544-39.87"></path>
                  <path
                    strokeLinejoin="round"
                    d="M109.988 43.269c-.98-4.277 1.606-7.742 1.49-11.938-2.883 1.396-8.855 3.965-12.196 3.507"
                  ></path>
                </g>
              </svg>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-600 hover:to-orange-600"
            >
              <Link href="/post" className="dark:text-white">
                <Plus className="mr-2 h-5 w-5" />
                Post a Notice
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-black"
            >
              <Link href="/notices">
                <Eye className="mr-2 h-5 w-5" />
                View Nearby Notices
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-8 max-w-md mx-auto"
          >
            <div className="text-center">
              <div className="text-2xl font-bold  flex items-center justify-center">
                {isLoadingStats ? (
                  <ShimmerText width="w-12" />
                ) : (
                  <>
                    <MessageSquare className="text-orange-500 h-6 w-6 mr-1" />
                    <span className="text-orange-400">
                      {stats.totalNotices}
                    </span>
                  </>
                )}
              </div>
              <div className="text-sm dark:text-gray-300 text-gray-600">
                Total Notices
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500 flex items-center justify-center">
                {isLoadingStats ? (
                  <ShimmerText width="w-12" />
                ) : (
                  <>
                    <Users className="h-6 w-6 mr-1" />
                    {stats.activeUsers}
                  </>
                )}
              </div>
              <div className="text-sm dark:text-gray-300 text-gray-600">
                Active Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 flex items-center justify-center">
                {isLoadingStats ? (
                  <ShimmerText width="w-12" />
                ) : (
                  <>
                    <TrendingUp className="h-6 w-6 mr-1" />
                    {stats.totalComments}
                  </>
                )}
              </div>
              <div className="text-sm dark:text-gray-300 text-gray-600">
                Total Comments
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const ShimmerText = ({ width }: { width: string }) => (
  <div className={` ${width} h-8 rounded relative overflow-hidden`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
  </div>
);
