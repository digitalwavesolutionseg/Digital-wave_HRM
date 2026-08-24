"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Search,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navSections, settingsItem } from "@/lib/navigation";
import { useSidebar } from "@/components/sidebar-context";
import { useAuth } from "@/components/auth-provider";
import { getInitials } from "@/lib/utils";

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();
  const { user } = useAuth();
  const pathname = usePathname();
  const [search, setSearch] = React.useState("");
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [recent, setRecent] = React.useState<string[]>([]);
  const [prevPathname, setPrevPathname] = React.useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (pathname && !recent.includes(pathname) && pathname !== "/") {
      setRecent((r) => [pathname, ...r].slice(0, 4));
    }
  }

  const filtered = React.useMemo(() => {
    if (!search.trim()) return navSections;
    const q = search.toLowerCase();
    return navSections
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) => i.title.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [search]);

  const toggleFavorite = (href: string) => {
    setFavorites((f) =>
      f.includes(href) ? f.filter((h) => h !== href) : [...f, href]
    );
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 264 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-sidebar-border bg-sidebar lg:flex"
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
          <img src="/logo.png" alt="Digital Wave" className="h-8 w-8 object-contain" />
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="text-sm font-semibold leading-tight">Digital Wave</span>
            <span className="text-[11px] text-muted-foreground">HRM Platform</span>
          </motion.div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "ml-0"
          )}
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pages..."
              className="h-9 w-full rounded-[12px] border border-border bg-card pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>
      )}

      {/* Scrollable nav */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {!collapsed && favorites.length > 0 && search.length === 0 && (
          <div>
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Favorites
            </p>
            {favorites.map((href) => {
              const item = navSections
                .flatMap((s) => s.items)
                .find((i) => i.href === href);
              if (!item) return null;
              return <NavButton key={href} item={item} pathname={pathname} collapsed={collapsed} isFavorite onToggleFavorite={toggleFavorite} />;
            })}
          </div>
        )}

        {!collapsed && recent.length > 0 && search.length === 0 && (
          <div>
            <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Recent
            </p>
            {recent.map((href) => {
              const item = navSections
                .flatMap((s) => s.items)
                .find((i) => i.href === href);
              if (!item) return null;
              return <NavButton key={href} item={item} pathname={pathname} collapsed={collapsed} />;
            })}
          </div>
        )}

        {filtered.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
            )}
            {collapsed && <div className="mb-2 border-t border-sidebar-border" />}
            {section.items.map((item) => (
              <NavButton
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                isFavorite={favorites.includes(item.href)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ))}

        {collapsed && <div className="my-2 border-t border-sidebar-border" />}
        <NavButton item={settingsItem} pathname={pathname} collapsed={collapsed} />
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {user ? getInitials(user.firstName, user.lastName) : "AM"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user ? `${user.firstName} ${user.lastName}`.trim() : "Admin User"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.role?.replaceAll("_", " ") ?? "Super Admin"}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

interface NavButtonProps {
  item: { title: string; href: string; icon: React.ComponentType<{ className?: string }>; badge?: string };
  pathname: string;
  collapsed: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (href: string) => void;
}

function NavButton({ item, pathname, collapsed, isFavorite, onToggleFavorite }: NavButtonProps) {
  const active = pathname === item.href;
  const Icon = item.icon;
  return (
    <div className="group relative mb-0.5">
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-[12px] px-2.5 py-2 text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-sidebar-foreground/80 hover:bg-muted hover:text-sidebar-foreground",
          collapsed && "justify-center px-0"
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" />
        {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
        {!collapsed && item.badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {item.badge}
          </span>
        )}
      </Link>
      {!collapsed && onToggleFavorite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(item.href);
          }}
          className={cn(
            "absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md p-1 group-hover:block",
            active ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Toggle favorite"
        >
          <Star className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
        </button>
      )}
    </div>
  );
}
