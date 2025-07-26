"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
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
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-miterlimit="10"
                >
                  <path d="M108.519 35.397c-9.013 8.839-24.133 9.449-34.974 3.485-4.474-2.461-10.037-7.56-8.195-13.4.818-2.596 4.623-7.007 7.465-3.78 3.573 4.061-3.756 11.358-6.245 13.396-6.997 5.731-16.648 7.996-25.507 6.503-20.278-3.415-29.921-23.09-37.544-39.87"></path>
                  <path
                    stroke-linejoin="round"
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
              <div className="text-2xl font-bold text-orange-500">500+</div>
              <div className="text-sm text-gray-600 dark:text-white">
                Active Users
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">1.2K+</div>
              <div className="text-sm text-gray-600 dark:text-white">
                Notices Posted
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">50+</div>
              <div className="text-sm text-gray-600 dark:text-white">
                Neighborhoods
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
