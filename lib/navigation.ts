import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Clock,
  CalendarClock,
  Wallet,
  UserPlus,
  Target,
  GraduationCap,
  Package,
  Megaphone,
  BarChart3,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    title: "People",
    items: [
      { title: "Employees", href: "/employees", icon: Users },
      { title: "Departments", href: "/departments", icon: Building2 },
      { title: "Positions", href: "/positions", icon: Briefcase },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Attendance", href: "/attendance", icon: Clock },
      { title: "Leave Requests", href: "/leave", icon: CalendarClock },
      { title: "Payroll", href: "/payroll", icon: Wallet },
    ],
  },
  {
    title: "Growth",
    items: [
      { title: "Recruitment", href: "/recruitment", icon: UserPlus },
      { title: "Performance", href: "/performance", icon: Target },
      { title: "Training", href: "/training", icon: GraduationCap },
    ],
  },
  {
    title: "Company",
    items: [
      { title: "Assets", href: "/assets", icon: Package },
      { title: "Announcements", href: "/announcements", icon: Megaphone },
      { title: "Reports", href: "/reports", icon: BarChart3 },
      { title: "AI Assistant", href: "/assistant", icon: Sparkles },
    ],
  },
];

export const settingsItem: NavItem = {
  title: "Settings",
  href: "/settings",
  icon: Settings,
};
