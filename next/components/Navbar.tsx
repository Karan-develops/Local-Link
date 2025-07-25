"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import ModeToggle from "./ToggleTheme";

export default function Navbar() {
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
        </div>
      </div>
    </header>
  );
}
