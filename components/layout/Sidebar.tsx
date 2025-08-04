'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthContext } from '@/lib/providers/AuthProvider';
import { logout } from '@/lib/api/auth';
import {
  DashboardIcon,
  UsersIcon,
  ProductsIcon,
  SettingsIcon,
  LogoutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon
} from '@/lib/icons/svg';
import { FolderKanban } from 'lucide-react';

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  module?: string; // Module permission required to display this item
};

const navItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    icon: DashboardIcon,
  },
  {
    title:'Category',
    href:'/category',
    icon:FolderKanban ,
    module:'categories',
    requiresAuth: true,
  },
  {
    title: 'Users',
    href: '/users',
    icon: UsersIcon,
    requiresAuth: true,
    module: 'users',
  },
  {
    title: 'Products',
    href: '/products',
    icon: ProductsIcon,
    requiresAuth: true,
    module: 'products',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    requiresAuth: true,
    module: 'settings',
  },
  {
    title: 'Roles',
    href: '/roles',
    icon: UsersIcon,
    requiresAuth: true,
    module: 'roles',
  },
  {
    title: 'Permissions',
    href: '/permissions',
    icon: SettingsIcon,
    requiresAuth: true,
    module: 'permissions',
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ProductsIcon,
    requiresAuth: true,
    module: 'orders',
  },
];

interface SidebarProps {
  onCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ onCollapse }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, refreshProfile, permissions } = useAuthContext();

  // Handle responsive behavior
  // Store onCollapse in a ref to avoid dependency changes
  const onCollapseRef = useRef(onCollapse);
  
  // Update ref when onCollapse changes
  useEffect(() => {
    onCollapseRef.current = onCollapse;
  }, [onCollapse]);
  
  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      
      let newCollapsedState = isCollapsed;
      if (window.innerWidth > 1024) {
        newCollapsedState = false;
      } else if (window.innerWidth < 768) {
        newCollapsedState = true;
      }
      
      if (newCollapsedState !== isCollapsed) {
        setIsCollapsed(newCollapsedState);
        // Notify parent component about collapse state change
        if (onCollapseRef.current) {
          onCollapseRef.current(newCollapsedState);
        }
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed]); // Only depend on isCollapsed

  const handleLogout = async () => {
    try {
      await logout();
      await refreshProfile();
      // Redirect to login page after logout
      window.location.href = '/authenticate?type=LOGIN&utm_source=direct';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      const newCollapsedState = !isCollapsed;
      setIsCollapsed(newCollapsedState);
      // Notify parent component about collapse state change
      if (onCollapseRef.current) {
        onCollapseRef.current(newCollapsedState);
      }
    }
  };

  // Mobile menu button (only visible on mobile)
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-4 left-4 z-50"
      onClick={toggleSidebar}
      aria-label="Toggle Menu"
    >
      <MenuIcon />
    </Button>
  );

  // Loading skeleton for sidebar
  if (isLoading) {
    return (
      <>
        <MobileMenuButton />
        <div className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r shadow-sm transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        )}>
          <div className="p-4 flex justify-between items-center">
            {!isCollapsed && <Skeleton className="h-8 w-32" />}
            <Skeleton className="h-8 w-8 ml-auto" />
          </div>
          <div className="flex-1 py-4 flex flex-col gap-2 px-2">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileMenuButton />
      
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r shadow-sm transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
        )}
      >
        <div className="p-4 flex justify-between items-center">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">Landson</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn("ml-auto")}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </Button>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
          {navItems.map((item) => {
            // Skip items that require auth if user is not authenticated
            if (item.requiresAuth && !isAuthenticated) return null;
            
            // Skip items that require specific module permissions if user doesn't have them
            if (item.module && (!permissions || !permissions.includes(item.module))) return null;
            
            const isActive = pathname === item.href;
            const NavIcon = item.icon;
            
            const navLink = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <NavIcon className={cn("shrink-0", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );
            
            return isCollapsed ? (
              <Tooltip key={item.href} content={item.title}>
                {navLink}
              </Tooltip>
            ) : (
              <div key={item.href}>{navLink}</div>
            );
          })}
        </nav>
        
        {isAuthenticated && (
          <div className="p-2 mt-auto">
            {isCollapsed ? (
              <Tooltip content="Logout">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-full justify-center"
                >
                  <LogoutIcon />
                </Button>
              </Tooltip>
            ) : (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-3"
              >
                <LogoutIcon className="shrink-0" />
                <span>Logout</span>
              </Button>
            )}
          </div>
        )}
        
        {isAuthenticated && !isCollapsed && (
          <div className="p-4 border-t flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}