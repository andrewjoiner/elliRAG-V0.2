import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import ChatContainer from "../chat/ChatContainer";

interface MainLayoutProps {
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Main application layout with sidebar and content area.
 * Uses Shadcn components for consistent styling.
 */
const MainLayout = ({ className = "" }: MainLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={cn("flex h-screen w-full bg-background", className)}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        className="h-screen"
      />

      <main
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-[280px]",
        )}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
