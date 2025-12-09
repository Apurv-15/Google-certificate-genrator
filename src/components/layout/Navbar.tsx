import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/editor", label: "Editor" },
  { path: "/generate", label: "Generate" },
  { path: "/verify", label: "Verify" },
];

export const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-200"
    >
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            {/* Google-style multicolor logo */}
            <div className="flex items-center gap-[2px]">
              <div className="w-2 h-8 rounded-sm" style={{ backgroundColor: "hsl(217, 89%, 61%)" }} />
              <div className="w-2 h-8 rounded-sm" style={{ backgroundColor: "hsl(4, 90%, 58%)" }} />
              <div className="w-2 h-8 rounded-sm" style={{ backgroundColor: "hsl(45, 100%, 51%)" }} />
              <div className="w-2 h-8 rounded-sm" style={{ backgroundColor: "hsl(142, 76%, 36%)" }} />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-medium text-xl text-gray-700">Google Developer</span>
              </div>
              <span className="text-xs text-gray-500 -mt-1">Certificate Generator</span>
            </div>
            <div className="sm:hidden">
              <span className="font-medium text-base text-gray-700">GDG Cert</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      location.pathname === item.path
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};
