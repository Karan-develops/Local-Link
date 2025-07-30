"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Upload,
  MapPin,
  Zap,
  Search,
  Calendar,
  HelpCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { useLocation } from "./LocationProvider";
import { useAuth } from "./AuthProvider";
import { formSchema } from "@/lib/validations";

// TODO: baadme real Api
const categories = [
  {
    value: "power-water",
    label: "Power/Water Cut",
    icon: Zap,
    color: "text-yellow-500",
  },
  {
    value: "lost-found",
    label: "Lost & Found",
    icon: Search,
    color: "text-blue-500",
  },
  {
    value: "local-event",
    label: "Local Event",
    icon: Calendar,
    color: "text-green-500",
  },
  {
    value: "help-request",
    label: "Help Request",
    icon: HelpCircle,
    color: "text-purple-500",
  },
  {
    value: "general",
    label: "General",
    icon: FileText,
    color: "text-gray-500",
  },
];

type FormData = z.infer<typeof formSchema>;

export function PostNoticeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { location, locationName } = useLocation();
  const { user } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      isAnonymous: false,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast("File too large!!, Please select an image smaller than 5MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast("Authentication required, Please sign in to post a notice.");
      return;
    }

    if (!location) {
      toast(
        "Location required, Please enable location access to post a notice."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const noticeData = {
        title: data.title,
        description: data.description,
        category: data.category,
        latitude: location.latitude,
        longitude: location.longitude,
        address: locationName,
        imageUrl: null, // TODO: Implement image upload
        isAnonymous: data.isAnonymous,
      };

      const response = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noticeData),
      });

      if (response.ok) {
        toast("Notice posted successfully!");
        form.reset();
        setSelectedImage(null);
        setImagePreview(null);
        // Redirect to notices page
        window.location.href = "/notices";
      } else {
        throw new Error("Failed to post notice");
      }
    } catch (error) {
      toast("Error posting notice, Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-600 dark:text-white mb-4">
            Please sign in to post a notice
          </p>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-500">
            <FileText className="h-5 w-5" />
            <span>Create New Notice</span>
          </CardTitle>
          {locationName && (
            <div className="flex items-center space-x-2 text-sm dark:text-white text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Posting to: {locationName}</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Power cut in Sector 15 - 2PM to 6PM"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center space-x-2">
                        <category.icon
                          className={`h-4 w-4 ${category.color}`}
                        />
                        <span>{category.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your notice..."
                rows={4}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-gray-400" />
                    <div>
                      <label htmlFor="image" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500">
                          Upload an image
                        </span>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="text-sm text-gray-500">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="anonymous">Post Anonymously</Label>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Your name won't be visible to other users
                </p>
              </div>
              <Switch
                id="anonymous"
                checked={form.watch("isAnonymous")}
                onCheckedChange={(checked) =>
                  form.setValue("isAnonymous", checked)
                }
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting Notice...
                </>
              ) : (
                "Post Notice"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
