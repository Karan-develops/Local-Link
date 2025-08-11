import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  Twitter,
  Instagram,
  GithubIcon,
  BadgeCheck,
  Linkedin,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Local Link</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Connecting Indian neighborhoods through digital community boards.
              Stay informed, stay connected, stay local.
            </p>
            <div className="flex space-x-4">
              <Link
                href={"https://x.com/mrkaran000"}
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href={"https://www.instagram.com/karan_aggarwal_00/"}
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href={"https://github.com/Karan-develops"}
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <GithubIcon className="h-5 w-5" />
              </Link>
              <Link
                href={"https://www.linkedin.com/in/karan-aggarwal-50a12b2b9/"}
                target="_blank"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/notices"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  View Notices
                </Link>
              </li>
              <li>
                <Link
                  href="/post"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Post Notice
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Map View
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>support@locallink.in</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <span className="flex items-center justify-center gap-2 mb-4">
            Author - Karan Aggarwal <BadgeCheck className=" text-green-500" />
          </span>
          <p>
            &copy; {new Date().getFullYear()} Local Link. All rights reserved.
            Made with ❤️ for Indian communities.
          </p>
        </div>
      </div>
    </footer>
  );
}
