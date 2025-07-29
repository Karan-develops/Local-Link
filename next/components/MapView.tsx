// TODO: Real data show krna h

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Map,
  MapPin,
  Layers,
  Filter,
  Zap,
  Search,
  Calendar,
  HelpCircle,
  FileText,
} from "lucide-react";
import { useLocation } from "./LocationProvider";

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

// Created By AI
const mapNotices = [
  {
    id: "1",
    title: "Power Cut in Sector 15",
    category: "power-water",
    coordinates: [28.4595, 77.0266],
    upvotes: 12,
  },
  {
    id: "2",
    title: "Lost Dog - Bruno",
    category: "lost-found",
    coordinates: [28.4605, 77.0276],
    upvotes: 8,
  },
  {
    id: "3",
    title: "Diwali Celebration",
    category: "local-event",
    coordinates: [28.4585, 77.0256],
    upvotes: 25,
  },
];

export function MapView() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mapStyle, setMapStyle] = useState("standard");
  const { locationName } = useLocation();

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

          {/* Recent Notices */}
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

        {/* Map Container */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px] rounded-lg flex items-center justify-center relative">
                {/* Map Placeholder */}
                <div className="text-center">
                  <Map className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-500 mb-2">
                    Interactive Map Coming Soon
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    This will display an interactive map with Google Maps or
                    Leaflet showing notice locations as pins. Users can click on
                    pins to view notice details.
                  </p>
                  <div className="mt-6 space-y-2">
                    <p className="text-sm text-gray-400">
                      Features to include:
                    </p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Clustered markers for better performance</li>
                      <li>• Real-time location updates</li>
                      <li>• Custom markers for different categories</li>
                      <li>• Click to view notice details</li>
                      <li>• User location indicator</li>
                    </ul>
                  </div>
                </div>

                {/* Map Controls Overlay */}
                <div className="absolute top-4 right-4 space-x-2">
                  <Button variant="outline" size="icon" className="bg-white">
                    <Layers className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="bg-white">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
