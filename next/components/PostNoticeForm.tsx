"use client";

import React, { useState } from "react";
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
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocation } from "./LocationProvider";
import { useAuth } from "./AuthProvider";
import { formSchema } from "@/lib/validations";
import {
  compressImage,
  uploadImage,
  validateImageFile,
} from "@/lib/firebase/upload-image";
import { createNotice } from "@/actions/notices.actions";

const categories = [
  {
    value: "power_water",
    label: "Power/Water Cut",
    icon: Zap,
    color: "text-red-500",
  },
  {
    value: "lost_found",
    label: "Lost & Found",
    icon: Search,
    color: "text-orange-500",
  },
  {
    value: "local_event",
    label: "Local Event",
    icon: Calendar,
    color: "text-green-500",
  },
  {
    value: "help_request",
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { location, locationName } = useLocation();
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      isAnonymous: false,
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validating image file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast("Invalid file");
      return;
    }

    try {
      setIsUploadingImage(true);

      // Compressing image before setting preview
      const compressedFile = await compressImage(file);
      setSelectedImage(compressedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(compressedFile);

      toast("Image selected, Image ready for upload");
    } catch (error) {
      toast("Error processing image, Please try selecting the image again");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
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
      let imageUrl = "";

      // Upload image to Firebase if selected
      if (selectedImage) {
        toast("Uploading image..., Please wait while we upload your image");

        imageUrl = await uploadImage(selectedImage, `notices/${user.uid}`);
      }

      // Create form data for server action
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("latitude", location.latitude.toString());
      formData.append("longitude", location.longitude.toString());
      formData.append("address", locationName || "");
      formData.append("isAnonymous", data.isAnonymous.toString());
      if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      const result = await createNotice(formData);

      if (result.success) {
        toast(
          "Notice posted successfully!, Your notice is now visible to the community"
        );
        form.reset();
        setSelectedImage(null);
        setImagePreview(null);
        router.push("/notices");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error posting notice:", error);
      toast("Error posting notice, Please try again later");
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
                    <div className="relative inline-block">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={removeImage}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedImage?.name} (
                      {(selectedImage?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        <p className="text-sm text-gray-500">
                          Processing image...
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <div>
                          <label htmlFor="image" className="cursor-pointer">
                            <span className="text-blue-600 hover:text-blue-500 font-medium">
                              Upload an image
                            </span>
                            <input
                              id="image"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                              disabled={isUploadingImage}
                            />
                          </label>
                          <p className="text-sm text-gray-500 mt-1">
                            PNG, JPG, WebP up to 5MB
                          </p>
                        </div>
                      </>
                    )}
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

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isUploadingImage}
            >
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
