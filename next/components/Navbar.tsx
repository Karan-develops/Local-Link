"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MapPin, Bell, User, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ModeToggle from "./ToggleTheme";
import { useLocation } from "./LocationProvider";
import { useAuth } from "./AuthProvider";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationsAsRead,
} from "@/actions/notifications.actions";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { locationName, isLoading } = useLocation();
  const { user, signOut } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "View Notices", href: "/notices" },
    { name: "Post Notice", href: "/post" },
    { name: "Map View", href: "/map" },
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const result = await getNotifications();

        if (result.success) {
          setNotifications(result.data);
          const unread = result.data.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        } else {
          console.error("Failed to fetch notifications:", result.error);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationsAsRead([notificationId], true);

      if (result.success) {
        setNotifications((prev: any) =>
          prev.map((n: any) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead();

      if (result.success) {
        setNotifications((prev: any) =>
          prev.map((n: any) => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
        toast("Success");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast("Error");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "COMMENT":
        return "💬";
      case "UPVOTE":
        return "👍";
      case "MENTION":
        return "@";
      default:
        return "🔔";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Local Link
            </span>
          </Link>

          <div className="hidden md:flex ml-64 items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="h-4 w-4" />
            {isLoading ? (
              <span className="animate-pulse text-gray-400 w-full">
                Detecting location...
              </span>
            ) : locationName ? (
              <span>{locationName}</span>
            ) : (
              <span className="text-red-500">Location unavailable</span>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-6 right-0">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-gray-700 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <ModeToggle />

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Popover
                    open={notificationsOpen}
                    onOpenChange={setNotificationsOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative border-2"
                      >
                        {notifications.length > 0 ? (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                        ) : (
                          <></>
                        )}
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-semibold">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleMarkAllAsRead}
                              className="text-xs"
                            >
                              Mark all read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setNotificationsOpen(false)}
                            className="h-6 w-6"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <ScrollArea className="h-96">
                        {loading ? (
                          <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">
                              Loading notifications...
                            </p>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center">
                            <Bell className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                              No notifications yet
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y">
                            {notifications.map((notification: any) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                                  !notification.isRead
                                    ? "bg-blue-50 border-l-4 border-l-blue-500"
                                    : ""
                                }`}
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="text-lg">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-xs text-gray-500">
                                        {notification.timeAgo}
                                      </p>
                                      {notification.relatedNotice && (
                                        <Link
                                          href={`/notices/${notification.relatedNotice.id}`}
                                          className="text-xs text-orange-600 hover:text-orange-700"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          View Notice
                                        </Link>
                                      )}
                                    </div>
                                  </div>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>

                      {notifications.length > 0 && (
                        <div className="p-4 border-t">
                          <Link
                            href="/dashboard"
                            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                            onClick={() => setNotificationsOpen(false)}
                          >
                            View all notifications →
                          </Link>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user?.photoURL || ""}
                            alt={user?.displayName || ""}
                          />
                          <AvatarFallback>
                            {user?.displayName?.charAt(0) ||
                              user?.email?.charAt(0) ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button asChild>
                  <Link href="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </nav>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8 ml-5">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium dark:text-white text-gray-700 hover:text-orange-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {isLoading ? (
                  <span className="animate-pulse text-gray-400 w-full">
                    Detecting location...
                  </span>
                ) : locationName ? (
                  <span>{locationName}</span>
                ) : (
                  <span className="text-red-500">Location unavailable</span>
                )}
                <ModeToggle />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
