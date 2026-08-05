import {
  Megaphone,
  Plus,
  Pin,
  CalendarDays,
  ScrollText,
  Info,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

type Category = "EVENT" | "POLICY" | "NOTICE";

type Announcement = {
  id: string;
  title: string;
  category: Category;
  body: string;
  author: string;
  time: string;
  pinned?: boolean;
};

const categoryMeta: Record<
  Category,
  { variant: "default" | "secondary" | "warning" | "info"; icon: React.ReactNode }
> = {
  EVENT: { variant: "default", icon: <CalendarDays className="h-3.5 w-3.5" /> },
  POLICY: { variant: "warning", icon: <ScrollText className="h-3.5 w-3.5" /> },
  NOTICE: { variant: "info", icon: <Info className="h-3.5 w-3.5" /> },
};

const announcements: Announcement[] = [
  {
    id: "1",
    title: "Company-wide Town Hall — Aug 12",
    category: "EVENT",
    body: "Join us for the quarterly town hall meeting at 2 PM in the main auditorium. The executive team will share Q3 priorities, product roadmap updates, and take live questions from the audience. Live stream will also be available for remote employees.",
    author: "Priya Sharma",
    time: "2h ago",
    pinned: true,
  },
  {
    id: "2",
    title: "New Remote Work Policy",
    category: "POLICY",
    body: "The updated remote work policy takes effect from September 1st. Employees may work remotely up to 3 days per week with manager approval. All requests must be logged through the HR portal.",
    author: "Daniel Okafor",
    time: "Yesterday",
  },
  {
    id: "3",
    title: "Office Renovation Notice — Floor 3",
    category: "NOTICE",
    body: "Floor 3 will undergo renovation next week. The engineering teams are temporarily moving to Floor 5, pods B and C. Please collect temporary access passes from reception.",
    author: "Facilities Team",
    time: "2d ago",
  },
  {
    id: "4",
    title: "Annual Health Checkup Drive",
    category: "EVENT",
    body: "Digital Wave is hosting an on-site health checkup drive on August 20th. Sessions run from 9 AM to 4 PM. Book your slot through the employee portal.",
    author: "Hannah Lee",
    time: "3d ago",
  },
  {
    id: "5",
    title: "Expense Reimbursement Deadline",
    category: "POLICY",
    body: "All Q2 expense reports must be submitted by August 28th to be included in the August payroll cycle. Late submissions will be processed in September.",
    author: "Marcus Webb",
    time: "4d ago",
  },
  {
    id: "6",
    title: "Cafeteria Menu — Week 32",
    category: "NOTICE",
    body: "The cafeteria will feature an international cuisine theme this week. All meals are complimentary for employees through Friday.",
    author: "Facilities Team",
    time: "5d ago",
  },
];

export default function AnnouncementsPage() {
  const pinned = announcements.filter((a) => a.pinned);
  const rest = announcements.filter((a) => !a.pinned);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 animate-fade-up">
      <PageHeader
        title="Announcements"
        description="Company news, policy updates, and upcoming events."
        actions={
          <Button>
            <Plus className="h-4 w-4" /> New Announcement
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
        </div>

        <aside className="space-y-4 lg:col-span-1">
          <div className="rounded-[20px] border border-border bg-card p-6 shadow-[0_6px_24px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold">Announcement Overview</h3>
            </div>
            <div className="mt-4 space-y-3">
              {[
                { label: "Total announcements", value: "128" },
                { label: "Published this month", value: "16" },
                { label: "Pinned", value: "3" },
                { label: "Drafts awaiting review", value: "4" },
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
            <h3 className="text-base font-semibold">Audience Reach</h3>
            <div className="mt-4 space-y-3">
              {[
                { label: "All employees", value: "248", pct: "100%" },
                { label: "Opened the latest notice", value: "221", pct: "89%" },
                { label: "Marked as read", value: "204", pct: "82%" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-medium">
                      {row.value} · {row.pct}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: row.pct }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}