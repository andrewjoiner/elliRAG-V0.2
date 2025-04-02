import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  FileText,
  Settings,
  BarChart3,
  Plus,
  ChevronRight,
  LogOut,
  HelpCircle,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar = ({
  className = "",
  collapsed = false,
  onToggleCollapse = () => {},
}: SidebarProps) => {
  const [activeSection, setActiveSection] = useState("chat");

  const navItems = [
    {
      id: "chat",
      label: "Chat",
      icon: <MessageSquare size={20} />,
      path: "/",
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FileText size={20} />,
      path: "/documents",
    },
    {
      id: "config",
      label: "Configuration",
      icon: <Settings size={20} />,
      path: "/config",
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 size={20} />,
      path: "/analytics",
    },
  ];

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background/95 border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-[280px]",
        className,
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <MessageSquare size={18} className="text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-lg">RAG Chat</h1>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 mx-auto rounded-md bg-primary flex items-center justify-center">
            <MessageSquare size={18} className="text-primary-foreground" />
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            <ChevronRight size={16} />
          </Button>
        )}
      </div>

      <div className="mt-2 px-2">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 mb-4",
            collapsed ? "px-2" : "px-4",
          )}
        >
          <Plus size={16} />
          {!collapsed && <span>New Chat</span>}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                    collapsed && "justify-center px-2",
                  )
                }
                onClick={() => setActiveSection(item.id)}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto px-2 pb-4">
        <Separator className="my-4" />
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <HelpCircle size={18} />
            {!collapsed && <span>Help & Resources</span>}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
              collapsed && "justify-center px-2",
            )}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
