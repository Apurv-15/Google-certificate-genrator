import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/editor", label: "Editor" },
  { path: "/generate", label: "Generate" },
  { path: "/verify", label: "Verify" },
];

export const Navbar = () => {
  const location = useLocation();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <nav className="max-w-6xl mx-auto glass-strong rounded-2xl px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg text-foreground">CertifyPro</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </motion.header>
  );
};
