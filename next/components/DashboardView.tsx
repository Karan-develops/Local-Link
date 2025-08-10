"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  MessageCircle,
  Clock,
  BarChart3,
  Users,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "./AuthProvider";
import { Notice } from "@/types/types";

const statsInit = {
  totalNotices: 0,
  totalUpvotes: 0,
  totalViews: 0,
  helpfulRating: 0,
};

export function DashboardView() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [stats, setStats] = useState(statsInit);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        const result = await response.json();

        if (result.success) {
          setStats(result.data.stats);
          setNotices(result.data.recentNotices);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleDeleteNotice = async (noticeId: string) => {
    try {
      const response = await fetch(`/api/notices/${noticeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotices((prev) =>
          prev.filter((notice: Notice) => notice.id !== noticeId)
        );
        toast("Notice deleted Successfully!");
      }
    } catch (error) {
      console.error("Error deleting notice:", error);
      toast("Error, Failed to delete notice.");
    }
  };

  const handleToggleResolved = async (noticeId: string) => {
    try {
      const notice = notices.find((n: any) => n.id === noticeId);
      const response = await fetch(`/api/notices/${noticeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isResolved: !notice?.isResolved,
        }),
      });

      if (response.ok) {
        setNotices((prev: any) =>
          prev.map((notice: Notice) =>
            notice.id === noticeId
              ? {
                  ...notice,
                  isResolved: !notice.isResolved,
                  status: notice.isResolved ? "active" : "resolved",
                }
              : notice
          )
        );
      }
    } catch (error) {
      console.error("Error updating notice:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Please sign in to view your dashboard
            </p>
            <Button asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
              <span className="text-orange-500">Welcome back,</span>{" "}
              {user.displayName || "User"}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your notices and track community engagement
            </p>
          </div>
          <Button asChild>
            <Link href="/post">
              <Plus className="mr-2 h-4 w-4" />
              Post New Notice
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Notices
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalNotices}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Upvotes
              </CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUpvotes}</div>
              <p className="text-xs text-muted-foreground">
                +12 from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                +89 from last week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Helpful Rating
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.helpfulRating}/5</div>
              <p className="text-xs text-muted-foreground">
                Based on community feedback
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="notices" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notices">My Notices</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Notices</CardTitle>
              <CardDescription>
                Manage and track your community notices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notices.map((notice: Notice, index) => (
                  <motion.div
                    key={notice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            {notice.title}
                          </h3>
                          <Badge
                            variant={
                              notice.isResolved ? "secondary" : "default"
                            }
                          >
                            {notice.isResolved ? "resolved" : "active"}
                          </Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-200 text-sm mb-3 line-clamp-2">
                          {notice.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm dark:text-gray-200 text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{notice.timeAgo}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{notice.upvotes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{notice.comments}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{notice.views}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleResolved(notice.id)}
                        >
                          {notice.isResolved ? "Mark Active" : "Mark Resolved"}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteNotice(notice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent interactions with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-3 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Your notice received 5 new upvotes
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-200">
                      2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <MessageCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      New comment on "Community Diwali Celebration"
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-200">
                      4 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-3 rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Bell className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Someone marked your lost item notice as helpful
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-200">
                      1 day ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={user.photoURL || ""}
                    alt={user.displayName || ""}
                  />
                  <AvatarFallback className="text-lg">
                    {user.displayName?.charAt(0) ||
                      user.email?.charAt(0) ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {user.displayName || "User"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-200">
                    {user.email}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent"
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-semibold">
                  Notification Preferences
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">
                      Email notifications for new nearby notices
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">
                      Push notifications for emergency alerts
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Weekly community digest</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
