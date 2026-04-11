import { Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 w-full">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 ">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between  md:gap-8 ">
          {/* Left Section - Logo & Mission */}
          <div className="">
            <div className="mb-6">
              {/* Logo */}
              <Link
                to="/"
                className="inline-flex w-fit cursor-pointer shrink-0 "
              >
                <img src="/logo.png" alt="SIDEGURUS Logo" className="h-14 md:h-18 w-auto " />
              </Link>{" "}
            </div>
            <p className="text-sm text-[#2B2B2B] leading-relaxed mb-6 max-w-sm px-4">
              At SideGurus, our mission is to connect people with trusted local
              services, making it easier for individuals and businesses to find
              the right help when they need it most.
            </p>
            {/* Social Media Icons */}
            <div className="flex gap-4 px-4 ">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#004C48] "
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2d7a6e] "
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2d7a6e] "
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Right Section - Navigation */}
          <div className="py-10 px-4">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-[#e07b39] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-sm text-gray-600 hover:text-[#e07b39] transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-sm text-gray-600 hover:text-[#e07b39] transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/events"
                  className="text-sm text-gray-600 hover:text-[#e07b39] transition-colors"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-600 hover:text-[#e07b39] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-gray-600 hover:text-[#e07b39] transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-200 bg-gray-50 w-full">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            © 2026 SideGurus. All rights reserved. Connecting people with
            trusted local services.
          </p>
          <div className="flex gap-6">
            <Link
              to="/privacy"
              className="text-xs text-gray-600 hover:text-[#e07b39] transition-colors"
            >
              Privacy
            </Link>
            <Link
              to="/safety-guide"
              className="text-xs text-gray-600 hover:text-[#e07b39] transition-colors"
            >
              Safety Guide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
