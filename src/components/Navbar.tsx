import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, Settings, TrendingUp, Plus, MapPin, Bell, Menu } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import AddVibeReportDialog from '@/components/AddVibeReportDialog';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, onClick }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex flex-col items-center py-2 px-3 transition-colors",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground"
      )
    }
    onClick={onClick}
  >
    <div className="mb-1">{icon}</div>
    <span className="text-xs">{label}</span>
  </NavLink>
);

const Navbar = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  if (!isMobile) {
    return <DesktopNavbar user={user} />;
  }

  return (
    <nav className="mobile-nav">
      <div className="container max-w-md mx-auto">
        <div className="flex items-center justify-around">
          <NavItem to="/" icon={<Home className="h-5 w-5" />} label="Home" />
          <NavItem to="/trending" icon={<TrendingUp className="h-5 w-5" />} label="Trending" />
          
          <AddVibeReportDialog 
            trigger={
              <button className="flex flex-col items-center py-2 px-3 transition-colors text-primary">
                <div className="mb-1 bg-primary text-white p-2 rounded-full">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-xs">Add Vibe</span>
              </button>
            }
          />

          {user ? (
            <>
              <NavItem to="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
              <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
            </>
          ) : (
            <NavItem to="/auth" icon={<User className="h-5 w-5" />} label="Sign In" />
          )}
        </div>
      </div>
    </nav>
  );
};

// Fix the User type by using the correct type from auth provider
const DesktopNavbar = ({ user }: { user: any }) => {
  return (
    <div className="fixed top-0 left-0 w-full border-b border-border/40 bg-background/95 backdrop-blur z-40">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <NavLink to="/" className="flex items-center space-x-2 text-primary">
              <MapPin className="h-6 w-6" />
              <span className="font-bold text-xl">HyperApp</span>
            </NavLink>
            
            <div className="hidden md:flex items-center space-x-6">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  cn("text-sm font-medium transition-colors", 
                     isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                Map
              </NavLink>
              <NavLink 
                to="/trending" 
                className={({ isActive }) => 
                  cn("text-sm font-medium transition-colors", 
                     isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                Trending
              </NavLink>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <AddVibeReportDialog 
              trigger={
                <Button size="sm" className="hidden md:flex">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vibe
                </Button>
              }
            />
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                2
              </span>
            </Button>
            
            {user ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center space-x-4 py-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{user.email?.split('@')[0]}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-3 py-4">
                      <NavItem to="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
                      <NavItem to="/settings" icon={<Settings className="h-5 w-5" />} label="Settings" />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button asChild>
                <NavLink to="/auth">Sign In</NavLink>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
