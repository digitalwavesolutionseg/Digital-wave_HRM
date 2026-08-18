"use client";

import * as React from "react";
import {
  Megaphone,
  Plus,
  Pin,
  CalendarDays,
  ScrollText,
  Info,
  Clock,
  Briefcase,
  Wallet,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import { AnnouncementFormDialog } from "./announcement-form-dialog";

type Category = "EVENT" | "POLICY" | "NOTICE" | "HR" | "PAYROLL" | "TRAINING" | "GENERAL";

type Announcement = {
  id: string;
  title: string;
  category: Category;
  body: string;
  author: string;
  time: string;
  date: string;
  pinned?: boolean;
};

interface AnnouncementApiItem {
  id: string;
  title: string;
  body: string;
  category: Category;
  pinned: boolean;
  author: { firstName: string; lastName: string } | null;
  createdAt: string;
}

const categoryMeta: Record<
  Category,
  { variant: "default" | "secondary" | "warning" | "info" | "success"; icon: React.ReactNode }
> = {
  EVENT: { variant: "default", icon: <CalendarDays className="h-3.5 w-3.5" /> },
  POLICY: { variant: "warning", icon: <ScrollText className="h-3.5 w-3.5" /> },
  NOTICE: { variant: "info", icon: <Info className="h-3.5 w-3.5" /> },
  HR: { variant: "secondary", icon: <Briefcase className="h-3.5 w-3.5" /> },
  PAYROLL: { variant: "warning", icon: <Wallet className="h-3.5 w-3.5" /> },
  TRAINING: { variant: "info", icon: <GraduationCap className="h-3.5 w-3.5" /> },
  GENERAL: { variant: "secondary", icon: <Megaphone className="h-3.5 w-3.5" /> },
};

function mapAnnouncement(item: AnnouncementApiItem): Announcement {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    body: item.body,
    author: item.author
      ? `${item.author.firstName} ${item.author.lastName}`
      : "—",
    time: formatDateTime(item.createdAt),
    date: item.createdAt,
    pinned: item.pinned,
  };
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<AnnouncementApiItem[]>("/announcements");
        if (cancelled) return;
        setAnnouncements(res.map(mapAnnouncement));
        setError(false);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const pinned = announcements.filter((a) => a.pinned);
  const rest = announcements.filter((a) => !a.pinned);
  const now = new Date();
  const publishedThisMonth = announcements.filter(
    (a) =>
      new Date(a.date).getFullYear() === now.getFullYear() &&
      new Date(a.date).getMonth() === now.getMonth()
  ).length;
  const latest = announcements.length > 0 ? announcements[0] : null;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Announcements"
        description="Company news, policy updates, and upcoming events."
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> New Announcement
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-40 w-full rounded-[20px]" />
              <Skeleton className="h-28 w-full rounded-[20px]" />
              <Skeleton className="h-28 w-full rounded-[20px]" />
            </div>
          ) : error ? (
            <EmptyState
              title="Unable to load announcements"
              description="Check that the backend API is reachable and you are signed in."
            />
          ) : (
            <>
              {pinned.map((a) => {
                const meta = categoryMeta[a.category];
                return (
                  <article
                    key={a.id}
                    className="relative mb-4 overflow-hidden rounded-[20px] border border-primary/20 bg-gradient-to-br from-accent via-card to-card p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)]"
                  >
                    <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-primary/10 blur-2xl" />
                    <div className="relative">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={meta.variant}>
                          {meta.icon}
                          {a.category}
                        </Badge>
                        <Badge variant="default">
                          <Pin className="h-3.5 w-3.5" /> Pinned
                        </Badge>
                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> {a.time}
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl font-bold tracking-tight">{a.title}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        {a.body}
                      </p>
                      <div className="mt-4 flex items-center gap-2.5">
                        <Avatar name={a.author} size="sm" />
                        <span className="text-sm font-medium">{a.author}</span>
                      </div>
                    </div>
                  </article>
                );
              })}

              <div className="space-y-4">
                {rest.map((a) => {
                  const meta = categoryMeta[a.category];
                  return (
                    <article
                      key={a.id}
                      className="rounded-[20px] border border-border bg-card p-5 shadow-[0_6px_24px_rgba(0,0,0,0.04)] transition-colors hover:border-primary/25"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={meta.variant}>
                          {meta.icon}
                          {a.category}
                        </Badge>
                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" /> {a.time}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-semibold">{a.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
                      <div className="mt-4 flex items-center gap-2.5">
                        <Avatar name={a.author} size="sm" />
                        <span className="text-sm font-medium">{a.author}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <aside className="space-y-4 lg:col-span-1">
          <div className="rounded-[20px] border border-border bg-card p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold">Announcement Overview</h3>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: "Total announcements", value: String(announcements.length) },
                { label: "Published this month", value: String(publishedThisMonth) },
                { label: "Pinned", value: String(pinned.length) },
                { label: "Latest", value: latest ? formatDateTime(latest.date) : "—" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between rounded-[14px] border border-border px-4 py-3"
                >
                  <span className="text-sm text-muted-foreground">{row.label}</span>
                  <span className="text-sm font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-card p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
            <h3 className="text-base font-semibold">By Category</h3>
            <div className="mt-4 space-y-3">
              {(Object.keys(categoryMeta) as Category[]).map((category) => {
                const count = announcements.filter((a) => a.category === category).length;
                const pct = announcements.length > 0 ? Math.round((count / announcements.length) * 100) : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {category.charAt(0) + category.slice(1).toLowerCase()}
                      </span>
                      <span className="font-medium">
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <AnnouncementFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onPublished={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
