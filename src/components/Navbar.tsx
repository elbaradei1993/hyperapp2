
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, User, Settings, Bell, Map, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ActionMenu from './ActionMenu';
import { supabase } from '@/integrations/supabase/client';
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
    <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border/40 py-1">
      <div className="container max-w-md mx-auto">
        <div className="flex items-center justify-around relative">
          <NavItem to="/" icon={<Home className="h-5 w-5" />} label="Home" />
          <NavItem to="/trending" icon={<TrendingUp className="h-5 w-5" />} label="Trending" />
          
          {/* Action button - positioned in the middle */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-7">
            <ActionMenu />
          </div>
          
          {/* Empty space for the action button */}
          <div className="h-5 w-5 opacity-0"></div>
          
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

const NotificationDropdown = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<Array<{
    id: string;
    type: 'vibe' | 'sos' | 'event';
    title: string;
    message: string;
    time: string;
    lat: number;
    lng: number;
  }>>([]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        const [vibesRes, sosRes] = await Promise.all([
          user
            ? supabase.from('vibe_reports').select('id,title,description,latitude,longitude,created_at').order('created_at', { ascending: false }).limit(5)
            : supabase.rpc('get_public_vibe_reports', { _limit: 5 }),
          user
            ? supabase.from('sos_alerts').select('id,type,latitude,longitude,created_at').order('created_at', { ascending: false }).limit(5)
            : Promise.resolve({ data: [] })
        ]);
        const toRel = (d?: string | null) => {
          if (!d) return 'now';
          const diff = Date.now() - new Date(d).getTime();
          const m = Math.max(1, Math.floor(diff / 60000));
          if (m < 60) return `${m}m ago`;
          const h = Math.floor(m / 60);
          if (h < 24) return `${h}h ago`;
          const days = Math.floor(h / 24);
          return `${days}d ago`;
        };
        const vibes = (vibesRes.data || []).map((v: any) => ({
          id: (v.id ?? '').toString(),
          type: 'vibe' as const,
          title: v.title || 'New Vibe',
          message: v.description || 'A vibe was reported near you',
          time: toRel(v.created_at as any),
          lat: parseFloat((v.latitude ?? '0') as string),
          lng: parseFloat((v.longitude ?? '0') as string)
        }));
        const soses = (sosRes.data || []).map(s => ({
          id: s.id as string,
          type: 'sos' as const,
          title: 'Safety Alert',
          message: `SOS: ${s.type}`,
          time: toRel(s.created_at as any),
          lat: parseFloat(s.latitude || '0'),
          lng: parseFloat(s.longitude || '0')
        }));
        const combined = [...vibes, ...soses]
          .filter(i => !isNaN(i.lat) && !isNaN(i.lng) && (i.lat !== 0 || i.lng !== 0))
          .slice(0, 8);
        setNotifications(combined);
        setNotificationCount(combined.length);
      } catch (e) {
        console.error('Load notifications failed', e);
      }
    };
    load();
  }, []);

  const handleReadAll = () => {
    setNotificationCount(0);
    toast({
      title: 'Notifications cleared',
      description: 'All notifications have been marked as read',
    });
  };

  const handleOpen = (n: typeof notifications[number]) => {
    sessionStorage.setItem('mapLocation', JSON.stringify({ lat: n.lat, lng: n.lng, zoom: 16 }));
    navigate('/pulse?tab=heatmap');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-auto p-1 hover:bg-transparent hover:text-primary"
            onClick={handleReadAll}
          >
            Mark all as read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-muted-foreground text-sm">No notifications</DropdownMenuItem>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={`${n.type}-${n.id}`} className="flex flex-col items-start p-3 cursor-pointer" onClick={() => handleOpen(n)}>
              <div className="font-medium">{n.title}</div>
              <div className="text-sm text-muted-foreground">{n.message}</div>
              <div className="text-xs text-muted-foreground mt-1">{n.time}</div>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-center">
          <Button variant="ghost" size="sm" className="w-full text-primary" asChild>
            <NavLink to="/pulse?tab=heatmap">Open Pulse</NavLink>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Fix the User type by using the correct type
const DesktopNavbar = ({ user }: { user: any }) => {
  return (
    <div className="fixed top-0 left-0 w-full border-b border-border/40 bg-background/95 backdrop-blur z-40 h-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <NavLink to="/" className="flex items-center space-x-2 text-primary">
              <span className="font-bold text-xl">HyperApp</span>
            </NavLink>
            <div className="hidden md:flex space-x-4">
              <NavLink to="/" className={({isActive}) => cn(
                "text-sm font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                <span className="flex items-center gap-1">
                  <Map className="h-4 w-4" />
                  Map
                </span>
              </NavLink>
              <NavLink to="/trending" className={({isActive}) => cn(
                "text-sm font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </span>
              </NavLink>
              <NavLink to="/communities" className={({isActive}) => cn(
                "text-sm font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Communities
                </span>
              </NavLink>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <ActionMenu />
            </div>
            <NotificationDropdown />
            
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
