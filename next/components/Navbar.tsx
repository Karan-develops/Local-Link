"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MapPin, Bell, User } from "lucide-react";
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

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { location, locationName, isLoading } = useLocation();
  const { user, signOut } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "View Notices", href: "/notices" },
    { name: "Post Notice", href: "/post" },
    { name: "Map View", href: "/map" },
  ];

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
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                  </Button>
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
