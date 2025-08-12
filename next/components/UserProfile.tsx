"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Award,
  TrendingUp,
  Edit,
  Save,
  X,
  UserPlus,
  UserMinus,
  Shield,
  Star,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import {
  followUser,
  getUserProfile,
  updateUserProfile,
} from "@/actions/user.actions";
import { toast } from "sonner";

interface UserProfileProps {
  userId?: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    location: "",
  });

  const isOwnProfile = !userId || userId === currentUser?.uid;

  useEffect(() => {
    fetchProfile();
  }, [userId, currentUser]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const result = await getUserProfile(userId);
      if (result.success) {
        setProfile(result.data);
        setEditForm({
          displayName: result.data?.displayName || "",
          location: result.data?.location || "",
        });
      } else {
        toast("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("displayName", editForm.displayName);
      formData.append("location", editForm.location);

      const result = await updateUserProfile(formData);
      if (result.success) {
        setIsEditing(false);
        await fetchProfile();
        toast("Your profile has been updated successfully");
      } else {
        toast("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleFollow = async () => {
    if (!profile?.id) return;

    try {
      const result = await followUser(profile.id);
      if (result.success) {
        setIsFollowing(result.action === "followed");
        toast(
          result.action === "followed" ? "Following user" : "Unfollowed user"
        );
      } else {
        toast("Failed to follow user");
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-200">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Profile not found
            </h3>
            <p className="text-gray-600 dark:text-gray-200">
              The user profile you're looking for doesn't exist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-6">
          <span className="text-orange-500">Welcome,</span>{" "}
          {profile.displayName || "User"}!
        </h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 mx-auto border-orange-500 border-2">
                    <AvatarImage
                      src={profile.photoUrl || ""}
                      alt={profile.displayName}
                    />
                    <AvatarFallback className="text-2xl">
                      {profile.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {profile.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <Input
                        value={editForm.displayName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            displayName: e.target.value,
                          })
                        }
                        placeholder="Display name"
                      />
                      <Input
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm({ ...editForm, location: e.target.value })
                        }
                        placeholder="Location"
                      />
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={handleSaveProfile}>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(false)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-200">
                        {profile.displayName}
                      </h1>
                      {profile.location && (
                        <div className="flex items-center justify-center dark:text-gray-200 text-gray-500 text-sm mt-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {profile.location}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  {isOwnProfile ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={handleFollow}
                      className="flex-1"
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {profile.stats.totalNotices}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-200">
                      Notices
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {profile.stats.helpfulVotes}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-200">
                      Helpful
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {profile.stats.totalComments}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-200">
                      Comments
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">
                      {profile.stats.totalUpvotes}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-200">
                      Upvotes
                    </div>
                  </div>
                </div>

                {/* Badges */}
                {profile.badges && profile.badges.length > 0 && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-2">
                      Badges
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {profile.badges.map((badge: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t text-center">
                  <div className="flex items-center justify-center dark:text-gray-400 text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {formatDate(profile.joinedAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notices">Notices</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.recentActivity &&
                  profile.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {profile.recentActivity.map(
                        (activity: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-start space-x-3 pb-4 border-b last:border-b-0"
                          >
                            <div className="flex-shrink-0">
                              {activity.type === "notice" ? (
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                  <MessageCircle className="h-4 w-4 text-orange-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <MessageCircle className="h-4 w-4 text-blue-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium dark:text-gray-200 text-gray-900">
                                  {activity.type === "notice"
                                    ? "Posted a notice"
                                    : "Left a comment"}
                                </p>
                                <span className="text-xs dark:text-gray-200 text-gray-500">
                                  {formatTimeAgo(activity.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {activity.type === "notice"
                                  ? activity.title
                                  : activity.content}
                              </p>
                              {activity.type === "notice" && (
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    {activity.upvotes}
                                  </div>
                                  <div className="flex items-center">
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    {activity.comments}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No recent activity
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notices" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Posted Notices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400">
                      Notices will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              {analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-200">
                            Total Notices
                          </span>
                          <span className="font-medium">
                            {analytics.overview.totalNotices}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-200">
                            Upvotes Received
                          </span>
                          <span className="font-medium">
                            {analytics.overview.totalUpvotesReceived}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-200">
                            Comments Made
                          </span>
                          <span className="font-medium">
                            {analytics.overview.totalComments}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-200">
                            Avg. Upvotes per Notice
                          </span>
                          <span className="font-medium">
                            {analytics.overview.averageUpvotesPerNotice.toFixed(
                              1
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Notices</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.topNotices.map(
                          (notice: any, index: number) => (
                            <div
                              key={notice.id}
                              className="flex items-center space-x-3"
                            >
                              <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-orange-600">
                                    {index + 1}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {notice.title}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span>{notice.upvotes} upvotes</span>
                                  <span>{notice.comments} comments</span>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-200">
                      Analytics data not available
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements & Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Star className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">First Notice</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-200">
                            Posted your first community notice
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <ThumbsUp className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Helpful Member</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-200">
                            Received 10+ upvotes
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Active Commenter</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-200">
                            Made 25+ comments
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
