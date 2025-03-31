import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Moon, Sun, User, Menu, X, Home, Pets, Users, FileText, LogOut, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useMobileCheck } from '@/hooks/use-mobile';
import NotificationsMenu from './NotificationsMenu';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  section: string;
}

const items: NavItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
    section: "main",
  },
  {
    title: "Pets",
    href: "/pets",
    icon: Pets,
    section: "main",
  },
  {
    title: "Owners",
    href: "/owners",
    icon: Users,
    section: "main",
  },
  {
    title: "Records",
    href: "/records",
    icon: FileText,
    section: "main",
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: Calendar,
    section: "main",
  },
];

const Navbar: React.FC = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { isLoggedIn, logout } = useAuth();
  const isMobile = useMobileCheck();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60")}>
      <div className="container flex h-16 items-center">
        <div className="flex gap-2 md:gap-10 justify-between md:justify-start w-full">
          <Link to="/" className="flex items-center space-x-2 shrink-0">
            <img
              src="/placeholder.svg"
              alt="Pet Health Hub Logo"
              className="h-8 w-8"
            />
            <span className="hidden md:inline-block font-semibold">Pet Health Hub</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {items.filter(item => item.section !== "profile").map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === item.href ? "text-foreground font-medium" : "text-foreground/60"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
          
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-end space-x-2 md:flex-1">
          {isLoggedIn && (
            <>
              <NotificationsMenu />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden">
          <div className="px-4 py-4 space-y-1 divide-y divide-border">
            {items.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="flex items-center gap-2 py-3"
                onClick={() => setShowMobileMenu(false)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
