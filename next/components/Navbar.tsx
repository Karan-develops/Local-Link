"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MapPin } from "lucide-react";
import ModeToggle from "./ToggleTheme";
import { useLocation } from "./LocationProvider";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { location, locationName } = useLocation();

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

          {locationName && (
            <div className="hidden md:flex ml-64 items-center space-x-1 text-sm dark:text-gray-400 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{locationName}</span>
            </div>
          )}

          <nav className="hidden md:flex items-center space-x-6">
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
          </nav>

          <div className="flex items-center md:hidden">
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
                  {locationName && (
                    <div className="space-y-1 text-sm dark:text-gray-400 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{locationName}</span>
                    </div>
                  )}
                  <ModeToggle />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
