"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Clock,
  ThumbsUp,
  MessageCircle,
  Share2,
  Flag,
  Send,
  Trash2,
  Eye,
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { getNoticeById, toggleUpvote } from "@/actions/notices.actions";
import { toast } from "sonner";
import {
  createComment,
  deleteComment,
  getComments,
} from "@/actions/comments.actions";
import { Notice } from "@/types/types";

interface NoticeDetailProps {
  noticeId: string;
}

const categoryColors = {
  POWER_WATER: "bg-yellow-100 text-yellow-800",
  LOST_FOUND: "bg-blue-100 text-blue-800",
  LOCAL_EVENT: "bg-green-100 text-green-800",
  HELP_REQUEST: "bg-purple-100 text-purple-800",
  GENERAL: "bg-gray-100 text-gray-800",
};

export function NoticeDetail({ noticeId }: NoticeDetailProps) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const { user } = useAuth();

  // Fetching notice and comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const noticeResult = await getNoticeById(noticeId);

        if (noticeResult.success) {
          setNotice(noticeResult.data ?? null);
        } else {
          toast("Failed to load notice");
          return;
        }

        const commentsResult = await getComments(noticeId);
        if (commentsResult.success) {
          setComments(commentsResult.data);
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
        toast("Failed to load notice details");
      } finally {
        setLoading(false);
      }
    };

    if (noticeId) {
      fetchData();
    }
  }, [noticeId]);

  const handleUpvote = async () => {
    if (!user) {
      toast("Authentication required, Please sign in to upvote");
      return;
    }

    try {
      const result = await toggleUpvote(noticeId);

      if (result.success) {
        setNotice((prev) => {
          if (!prev) return prev;
          const action = result.success && result.data && result.data.action;
          return {
            ...prev,
            upvotes: action === "added" ? prev.upvotes + 1 : prev.upvotes - 1,
            hasUpvoted: action === "added",
          };
        });
      } else {
        toast("Failed to upvote");
      }
    } catch (error) {
      console.error("Error upvoting notice:", error);
      toast("Failed to upvote notice");
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast("Please enter a comment");
      return;
    }

    try {
      setSubmittingComment(true);

      const formData = new FormData();
      formData.append("noticeId", noticeId);
      formData.append("content", newComment.trim());
      if (isAnonymous) {
        formData.append("isAnonymous", "true");
      }

      const result = await createComment(formData);

      if (result.success) {
        setComments((prev) => [result.data, ...prev]);
        setNewComment("");
        setIsAnonymous(false);

        // Update comment count
        setNotice((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            comments: prev.comments + 1,
          };
        });

        toast("Comment posted successfully");
      } else {
        toast("Failed to post comment");
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      toast("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const result = await deleteComment(commentId);

      if (result.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setNotice((prev: any) => ({
          ...prev,
          comments: prev.comments - 1,
        }));

        toast("Comment deleted successfully");
      } else {
        toast("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast("Failed to delete comment");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notice details...</p>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">Notice not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <Badge
                className={
                  categoryColors[notice.category as keyof typeof categoryColors]
                }
              >
                {notice.category.replace("_", " ")}
              </Badge>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>

            <CardTitle className="text-2xl mb-4">{notice.title}</CardTitle>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    {!notice.isAnonymous && notice.authorAvatar && (
                      <AvatarImage
                        src={notice.authorAvatar || "/placeholder.svg"}
                        alt={notice.author}
                      />
                    )}
                    <AvatarFallback className="border-2">
                      {notice.isAnonymous ? "A" : notice.author?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="dark:text-gray-200">{notice.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span className="dark:text-gray-200">{notice.timeAgo}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span className="dark:text-gray-200">{notice.distance}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm dark:text-emerald-500 text-gray-500">
                <Eye className="h-4 w-4" />
                {notice.views} views
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {notice.imageUrl && (
              <img
                src={notice.imageUrl || "/placeholder.svg"}
                alt="Notice image"
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <p className="text-gray-700 dark:text-white mb-6 whitespace-pre-wrap">
              {notice.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant={notice.hasUpVoted ? "default" : "outline"}
                  size="sm"
                  onClick={handleUpvote}
                  className="flex items-center space-x-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{notice.upvotes}</span>
                </Button>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MessageCircle className="h-4 w-4" />
                  <span className="dark:text-gray-300">
                    {notice.comments} comments
                  </span>
                </div>
              </div>

              {notice.isResolved && <Badge variant="secondary">Resolved</Badge>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.photoURL || ""}
                      alt={user.displayName || ""}
                    />
                    <AvatarFallback>
                      {user.displayName?.charAt(0) ||
                        user.email?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mb-3"
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isAnonymous}
                          onChange={(e) => setIsAnonymous(e.target.checked)}
                          className="rounded"
                        />
                        <span>Post anonymously</span>
                      </label>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={submittingComment || !newComment.trim()}
                      >
                        {submittingComment ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600 mb-2">
                  Please sign in to post a comment
                </p>
                <Button asChild size="sm">
                  <a href="/auth">Sign In</a>
                </Button>
              </div>
            )}

            <Separator className="mb-6" />

            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    No comments yet. Be the first to comment!
                  </p>
                </div>
              ) : (
                comments.map((comment: any, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <Avatar className="h-8 w-8">
                      {!comment.isAnonymous && comment.user?.photoUrl && (
                        <AvatarImage
                          src={comment.user.photoUrl || "/placeholder.svg"}
                          alt={comment.user.displayName || ""}
                        />
                      )}
                      <AvatarFallback>
                        {comment.isAnonymous
                          ? "A"
                          : comment.user?.displayName?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-sm">
                          {comment.isAnonymous
                            ? "Anonymous"
                            : comment.user?.displayName || "User"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                        {user?.uid === comment.userId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-200 text-sm whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
