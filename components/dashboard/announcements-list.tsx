"use client";

import * as React from "react";
import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";

interface AnnouncementApiItem {
  id: string;
  title: string;
  body: string;
  category: string;
  createdAt: string;
}

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = React.useState<AnnouncementApiItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.get<AnnouncementApiItem[]>("/announcements");
        if (cancelled) return;
        setAnnouncements((res ?? []).slice(0, 3));
      } catch {
        // fall through to empty list
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Megaphone className="h-4 w-4 text-primary" /> Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] w-full rounded-[16px]" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Megaphone className="h-4 w-4 text-primary" /> Announcements
        </CardTitle>
        <Badge variant="muted">{announcements.length} new</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="rounded-[16px] border border-border p-4 transition-colors hover:bg-muted/40">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{a.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
