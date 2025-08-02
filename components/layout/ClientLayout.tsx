'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
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
  
  if (isAuthPage) {
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