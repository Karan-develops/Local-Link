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
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12 mt-32"
          >
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
