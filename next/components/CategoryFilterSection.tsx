"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Zap,
  Droplets,
  Calendar,
  Search,
  Heart,
  MessageSquare,
  Clock,
  MapPin,
  ThumbsUp,
  RefreshCw,
  Grid3X3,
  Paperclip,
} from "lucide-react";
import Link from "next/link";
import { getNotices } from "@/actions/notices.actions";
import CardSkeleton from "./CardSkeleton";

interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  authorAvatar: string | null;
  timeAgo: string;
  distance: string;
  upvotes: number;
  comments: number;
  views: number;
  isAnonymous: boolean;
  imageUrl: string | null;
}

const categories = [
  {
    id: "all",
    label: "All",
    icon: Grid3X3,
    color: "bg-blue-500 text-black hover:text-black!",
    borderColor: "border-blue-500",
  },
  {
    id: "POWER_WATER",
    label: "Power Cut",
    icon: Zap,
    color: "bg-red-700! hover:bg-red-800!",
    borderColor: "border-red-500",
  },
  {
    id: "WATER_CUT",
    label: "Water Cut",
    icon: Droplets,
    color: "bg-blue-800! hover:bg-blue-700!",
    borderColor: "border-blue-500",
  },
  {
    id: "LOCAL_EVENT",
    label: "Events",
    icon: Calendar,
    color: "bg-green-900! hover:bg-green-800!",
    borderColor: "border-green-500",
  },
  {
    id: "LOST_FOUND",
    label: "Lost & Found",
    icon: Search,
    color: "bg-orange-700! hover:bg-orange-800!",
    borderColor: "border-orange-500",
  },
  {
    id: "HELP_REQUEST",
    label: "Help Request",
    icon: Heart,
    color: "bg-purple-700! hover:bg-purple-800!",
    borderColor: "border-purple-500",
  },
  {
    id: "GENERAL",
    label: "General",
    icon: MessageSquare,
    color: "bg-gray-700! hover:bg-gray-800!",
    borderColor: "border-gray-500",
  },
];

export function CategoryFilterSection() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, [selectedCategory]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const result = await getNotices({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        sortBy: "recent",
      });

      if (result.success && result.data) {
        const mappedNotices = result.data.map((notice: any) => ({
          ...notice,
          distance: notice.distance ?? "",
        }));
        setNotices(mappedNotices);

        const counts: Record<string, number> = { all: mappedNotices.length };
        mappedNotices.forEach((notice: Notice) => {
          counts[notice.category] = (counts[notice.category] || 0) + 1;
        });
        setCategoryCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryStyle = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category || categories[0];
  };

  const getNoticeCardBorderColor = (noticeCategory: string) => {
    const category = categories.find((c) => c.id === noticeCategory);
    return category?.borderColor || "border-gray-300";
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold dark:text-gray-100 text-gray-900 mb-2">
              Filter by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Browse notices by category to find what matters to you
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNotices}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            {selectedCategory !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => {
            const count = categoryCounts[category.id] || 0;
            const isSelected = selectedCategory === category.id;

            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center bg-white! hover:cursor-pointer space-x-2 ${
                  isSelected
                    ? "bg-blue-600! text-white hover:bg-blue-700!"
                    : category.color
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.label}</span>
                <Badge
                  variant="secondary"
                  className={`ml-1 ${
                    isSelected
                      ? "bg-blue-400 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-xl font-semibold dark:text-gray-200">
              Recent Notices <Paperclip className="size-5" />
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              {notices.length} notices found
            </p>
          </div>
        </div>

        {loading ? (
          <CardSkeleton />
        ) : notices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <MessageSquare className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No notices found</h3>
            <p className="text-gray-500 mb-6">
              {selectedCategory === "all"
                ? "Be the first to post a notice in your community!"
                : `No notices found in the ${
                    getCategoryStyle(selectedCategory).label
                  } category.`}
            </p>
            <Button asChild>
              <Link href="/post">
                <MessageSquare className="h-4 w-4 mr-2" />
                Post a Notice
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card
                  className={`h-full transition-all duration-300 border-2 ${getNoticeCardBorderColor(
                    notice.category
                  )}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        className={getCategoryStyle(notice.category).color}
                      >
                        {React.createElement(
                          getCategoryStyle(notice.category).icon,
                          {
                            className: "w-3 h-3 mr-1 text-white!",
                          }
                        )}
                        <span className="text-white">
                          {getCategoryStyle(notice.category).label}
                        </span>
                      </Badge>
                      <div className="flex items-center text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {notice.timeAgo}
                      </div>
                    </div>
                    <CardTitle className="text-base leading-tight line-clamp-2">
                      {notice.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {notice.imageUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden">
                        <img
                          src={notice.imageUrl || "/placeholder.svg"}
                          alt={notice.title}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}

                    <p className="text-sm mb-4 line-clamp-3">
                      {notice.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          {!notice.isAnonymous && notice.authorAvatar && (
                            <AvatarImage
                              src={notice.authorAvatar || "/placeholder.svg"}
                              alt={notice.author}
                            />
                          )}
                          <AvatarFallback className="text-xs">
                            {notice.isAnonymous ? "A" : notice.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm  truncate">
                          {notice.author}
                        </span>
                      </div>
                      <div className="flex items-center text-xs ">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate max-w-16">
                          {notice.distance}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-sm  dark:text-gray-300 hover:text-red-500 transition-colors">
                          <ThumbsUp className="w-4 h-4" />
                          <span>{notice.upvotes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm dark:text-gray-300 hover:text-blue-500 transition-colors">
                          <MessageSquare className="w-4 h-4" />
                          <span>{notice.comments}</span>
                        </button>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="dark:bg-gray-800"
                      >
                        <Link href={`/notices/${notice.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {notices.length > 0 && (
          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/notices">View All Notices</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
