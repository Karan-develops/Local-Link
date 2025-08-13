"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Filter,
  Zap,
  Search,
  Calendar,
  HelpCircle,
  FileText,
} from "lucide-react";
import { useLocation } from "./LocationProvider";
import { getNotices } from "@/actions/notices.actions";

const categories = [
  {
    value: "all",
    label: "All Categories",
    icon: FileText,
    color: "bg-gray-500",
  },
  {
    value: "power-water",
    label: "Power/Water Cut",
    icon: Zap,
    color: "bg-yellow-500",
  },
  {
    value: "lost-found",
    label: "Lost & Found",
    icon: Search,
    color: "bg-blue-500",
  },
  {
    value: "local-event",
    label: "Local Event",
    icon: Calendar,
    color: "bg-green-500",
  },
  {
    value: "help-request",
    label: "Help Request",
    icon: HelpCircle,
    color: "bg-purple-500",
  },
];

export function MapView() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mapStyle, setMapStyle] = useState("standard");
  const { locationName, location } = useLocation();
  const [mapNotices, setMapNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getNotices({
          lat: location?.latitude,
          lng: location?.longitude,
          category: selectedCategory,
          sortBy: "recent",
          radius: 10,
        });

        if (res.success) {
          setMapNotices(res.data ?? []);
        } else {
          setMapNotices([]);
        }
      } catch (err) {
        console.error(err);
        setMapNotices([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCategory]);

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
          Community Map
        </h1>
        {locationName && (
          <div className="flex items-center space-x-2 dark:text-gray-300 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>Showing notices near {locationName}</span>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium space-y-1 mb-1">
                  Category
                </label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          <category.icon className="h-4 w-4" />
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Map Style */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Map Style</label>
                <Select value={mapStyle} onValueChange={setMapStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                    <SelectItem value="terrain">Terrain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Legend */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Legend</label>
                <div className="space-y-2">
                  {categories.slice(1).map((category) => (
                    <div
                      key={category.value}
                      className="flex items-center space-x-2"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${category.color}`}
                      ></div>
                      <span className="text-xs">{category.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Notices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mapNotices.map((notice) => {
                  const category = categories.find(
                    (c) => c.value === notice.category
                  );
                  return (
                    <div
                      key={notice.id}
                      className="p-3 border rounded-lg hover:bg-gray-900 cursor-pointer"
                    >
                      <div className="flex items-start space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${category?.color} mt-2`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2">
                            {notice.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {notice.upvotes} upvotes
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px] rounded-lg flex items-center justify-center relative">
                {location?.latitude && location?.longitude ? (
                  <iframe
                    src={`https://www.google.com/maps?q=${location.latitude},${location.longitude}&hl=es;z=14&output=embed`}
                    className="w-full h-full rounded-lg"
                    loading="lazy"
                  ></iframe>
                ) : (
                  <div className="text-gray-500 dark:text-gray-200">
                    Fetching location...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
