"use client";

import * as React from "react";
import { Bell, LogOut, MessageSquare, Moon, Plus, Search, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useSidebar } from "@/components/sidebar-context";
import { useAuth } from "@/components/auth-provider";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { collapsed } = useSidebar();
  const { user, logout } = useAuth();

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "Admin";
  const initials = user ? getInitials(user.firstName, user.lastName) : "AM";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md transition-all duration-250 sm:px-6",
        collapsed ? "lg:pl-[88px]" : "lg:pl-[280px]"
      )}
    >
      {/* Global search */}
      <div className="relative hidden w-full max-w-md flex-1 sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search employees, departments, documents..."
          className="h-10 w-full rounded-[14px] border border-border bg-card pl-9 pr-14 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Quick actions */}
        <QuickActionsButton label="Add employee" />
        <IconButton label="Messages">
          <MessageSquare className="h-[18px] w-[18px]" />
        </IconButton>
        <IconButton label="Notifications" badge="3">
          <Bell className="h-[18px] w-[18px]" />
        </IconButton>
        <IconButton label="Toggle theme" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </IconButton>

        <div className="mx-2 h-6 w-px bg-border" />

        <div className="relative">
          <button className="flex items-center gap-2 rounded-[12px] p-1.5 transition-colors hover:bg-muted">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {initials}
            </div>
            <span className="hidden text-sm font-medium sm:block">{fullName}</span>
          </button>
          <button
            onClick={() => void logout()}
            aria-label="Log out"
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-[12px] text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive active:scale-95"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}

function IconButton({
  label,
  badge,
  onClick,
  children,
}: {
  label: string;
  badge?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative flex h-10 w-10 items-center justify-center rounded-[12px] text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
    >
      {children}
      {badge && (
        <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

function QuickActionsButton({ label }: { label: string }) {
  return (
    <button className="flex h-10 items-center gap-1.5 rounded-[12px] bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-95">
      <Plus className="h-4 w-4" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}