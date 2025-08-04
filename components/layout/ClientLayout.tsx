'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@/lib/providers/AuthProvider';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthContext();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSidebarCollapsed(window.innerWidth < 1024 && window.innerWidth >= 768);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Don't show sidebar on authentication pages
  const isAuthPage = pathname?.startsWith('/authenticate');
  
  // Hide sidebar for unauthenticated users on root page
  const hideSidebar = pathname === '/authenticate' || (!isAuthenticated && pathname === '/');
  
  if (hideSidebar) {
    return <>{children}</>;
  }
  
  // Function to handle sidebar collapse state
  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar onCollapse={handleSidebarCollapse} />
      <main className={cn(
        "transition-all duration-300 p-4 md:p-6",
        isMobile ? "ml-0" : (isSidebarCollapsed ? "md:ml-16" : "md:ml-64")
      )}>
        {children}
      </main>
    </div>
  );
}