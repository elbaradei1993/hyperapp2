
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Settings, TrendingUp } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40 z-40">
      <div className="container max-w-md mx-auto">
        <div className="flex items-center justify-around">
          <NavItem to="/" icon={<Home />} label="Home" />
          <NavItem to="/trending" icon={<TrendingUp />} label="Trending" />
          {user ? (
            <>
              <NavItem to="/profile" icon={<User />} label="Profile" />
              <NavItem to="/settings" icon={<Settings />} label="Settings" />
            </>
          ) : (
            <NavItem to="/auth" icon={<User />} label="Sign In" />
          )}
        </div>
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem = ({ to, icon, label }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center py-2 px-3 transition-colors ${
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      }`
    }
  >
    <div className="mb-1">{icon}</div>
    <span className="text-xs">{label}</span>
  </NavLink>
);

export default Navbar;
