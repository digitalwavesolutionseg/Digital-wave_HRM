import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const announcements = [
  {
    title: "Company-wide Town Hall — Aug 12",
    body: "Join us for the quarterly town hall meeting at 2 PM in the main auditorium.",
    time: "2h ago",
    type: "event" as const,
  },
  {
    title: "New Leave Policy Update",
    body: "The updated vacation accrual policy takes effect from September 1st.",
    time: "Yesterday",
    type: "policy" as const,
  },
  {
    title: "Office Renovation Notice",
    body: "Floor 3 will undergo renovation next week. Work from home recommended.",
    time: "2d ago",
    type: "notice" as const,
  },
];

export function AnnouncementsList() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Megaphone className="h-4 w-4 text-primary" /> Announcements
        </CardTitle>
        <Badge variant="muted">{announcements.length} new</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.map((a) => (
          <div key={a.title} className="rounded-[16px] border border-border p-4 transition-colors hover:bg-muted/40">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{a.title}</p>
              <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}