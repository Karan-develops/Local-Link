"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MapPin,
  Clock,
  ThumbsUp,
  MessageCircle,
  Zap,
  Calendar,
  HelpCircle,
  FileText,
  Map,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "./LocationProvider";
import { useAuth } from "./AuthProvider";
import { Notice } from "@/types/types";

//  TODO: Baadme actual API calls krni h
const categories = [
  { value: "all", label: "All Categories", icon: FileText },
  { value: "power-water", label: "Power/Water Cut", icon: Zap },
  { value: "lost-found", label: "Lost & Found", icon: Search },
  { value: "local-event", label: "Local Event", icon: Calendar },
  { value: "help-request", label: "Help Request", icon: HelpCircle },
];

const categoryColors = {
  "power-water": "bg-yellow-100 text-yellow-800",
  "lost-found": "bg-blue-100 text-blue-800",
  "local-event": "bg-green-100 text-green-800",
  "help-request": "bg-purple-100 text-purple-800",
  general: "bg-gray-100 text-gray-800",
};

export function NoticesView() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredNotices, setFilteredNotices] = useState<Notice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [radiusFilter, setRadiusFilter] = useState("10");
  const { locationName, location } = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          ...(location && {
            lat: location.latitude.toString(),
            lng: location.longitude.toString(),
          }),
          radius: radiusFilter,
          ...(selectedCategory !== "all" && { category: selectedCategory }),
          ...(searchQuery && { search: searchQuery }),
          sortBy,
        });

        const response = await fetch(`/api/notices?${params}`);
        const result = await response.json();

        if (result.success) {
          setNotices(result.data);
        }
      } catch (error) {
        console.error("Error fetching notices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [location, radiusFilter, selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    let filtered = notices;

    if (searchQuery) {
      filtered = filtered.filter(
        (notice) =>
          notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notice.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (notice) => notice.category === selectedCategory
      );
    }

    // Sort notices
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime();
        case "popular":
          return b.upvotes - a.upvotes;
        case "distance":
          return Number.parseFloat(a.distance) - Number.parseFloat(b.distance);
        default:
          return 0;
      }
    });

    setFilteredNotices(filtered);
  }, [notices, searchQuery, selectedCategory, sortBy]);

  const handleUpvote = async (noticeId: string) => {
    if (!user) {
      toast("Authentication required");
      return;
    }

    try {
      const response = await fetch(`/api/notices/${noticeId}/upvote`, {
        method: "POST",
      });

      if (response.ok) {
        const params = new URLSearchParams({
          ...(location && {
            lat: location.latitude.toString(),
            lng: location.longitude.toString(),
          }),
          radius: radiusFilter,
          ...(selectedCategory !== "all" && { category: selectedCategory }),
          ...(searchQuery && { search: searchQuery }),
          sortBy,
        });

        const noticesResponse = await fetch(`/api/notices?${params}`);
        const result = await noticesResponse.json();

        if (result.success) {
          setNotices(result.data);
        }
      }
    } catch (error) {
      console.error("Error upvoting notice:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-gray-300 text-gray-900 mb-2">
          Nearby Notices
        </h1>
        {locationName && (
          <div className="flex items-center space-x-2 text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>Showing notices near {locationName}</span>
          </div>
        )}
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-10"
              />
            </div>
            <div className="flex gap-4 flex-wrap justify-end w-fit">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <span className="flex items-center space-x-2">
                        <category.icon className="h-4 w-4" />
                        <span>{category.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="distance">Nearest</SelectItem>
                </SelectContent>
              </Select>

              <Select value={radiusFilter} onValueChange={setRadiusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Within 5 km</SelectItem>
                  <SelectItem value="10">Within 10 km</SelectItem>
                  <SelectItem value="20">Within 20 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="mb-6">
        <TabsList>
          <TabsTrigger
            value="list"
            className="flex items-center space-x-2 hover:cursor-pointer"
          >
            <List className="h-4 w-4" />
            <span>List View</span>
          </TabsTrigger>
          <TabsTrigger
            value="map"
            className="flex items-center space-x-2 hover:cursor-pointer"
          >
            <Map className="h-4 w-4" />
            <span>Map View</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <div className="mb-4">
            <p className="text-sm dark:text-gray-300 text-gray-600">
              Showing {filteredNotices.length} notices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        className={
                          categoryColors[
                            notice.category as keyof typeof categoryColors
                          ]
                        }
                      >
                        A{notice.categoryLabel}
                      </Badge>
                      <div className="flex items-center text-sm dark:text-gray-200 text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {notice.timeAgo}
                      </div>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {notice.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {notice.imageUrl && (
                      <img
                        src={notice.imageUrl || "/placeholder.svg"}
                        alt="Notice image"
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}

                    <p className="text-gray-600 dark:text-gray-200 text-sm mb-4 line-clamp-3">
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
                        <span className="text-sm dark:text-gray-200 text-gray-600">
                          {notice.author}
                        </span>
                      </div>
                      <div className="flex items-center text-sm dark:text-gray-200 text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate max-w-20">
                          {notice.distance}A
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleUpvote(notice.id)}
                          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-orange-500 transition-colors"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{notice.upvotes}</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          <span>{notice.comments}</span>
                        </button>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredNotices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-300 mb-4">
                No notices found matching your criteria
              </p>
              <Button asChild>
                <a href="/post">Post the First Notice</a>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <div className="h-96 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  {/* TODO: show notice locations as pins on an interactive */}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
