import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./layout/Sidebar";
import ChatContainer from "./chat/ChatContainer";

interface HomeProps {
  /**
   * Additional CSS class names
   */
  className?: string;
}

/**
 * Main chat interface page with sidebar navigation and chat container.
 * This is the primary interface for user interaction with the RAG-enabled LLM.
 */
const Home = ({ className = "" }: HomeProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Toggle sidebar collapse state
  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className={cn("flex h-screen w-full bg-background", className)}>
      {/* Sidebar navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        className="h-screen"
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatContainer isConnected={isConnected} className="flex-1" />
      </div>
    </div>
  );
};

export default Home;
