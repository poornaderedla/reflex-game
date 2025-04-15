
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Trophy, Settings } from "lucide-react";

const Navbar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-luxury-white/10 bg-luxury-black/90 backdrop-blur-lg">
      <div className="mx-auto max-w-md">
        <div className="flex h-16 items-center justify-around px-4">
          <NavItem
            to="/"
            icon={<Home className="h-6 w-6" />}
            label="Home"
            isActive={path === "/"}
          />
          <NavItem
            to="/leaderboard"
            icon={<Trophy className="h-6 w-6" />}
            label="Leaderboard"
            isActive={path === "/leaderboard"}
          />
          <NavItem
            to="/settings"
            icon={<Settings className="h-6 w-6" />}
            label="Settings"
            isActive={path === "/settings"}
          />
        </div>
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex w-full flex-col items-center justify-center transition-colors ${
        isActive
          ? "text-luxury-gold"
          : "text-luxury-white/70 hover:text-luxury-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-md ${
          isActive ? "bg-luxury-gold/10" : "bg-transparent"
        }`}
      >
        {icon}
      </div>
      <span className="mt-1 text-xs font-medium">{label}</span>
    </Link>
  );
};

export default Navbar;
