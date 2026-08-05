import { Cake, CalendarClock, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const birthdays = [
  { name: "Sara El-Masry", role: "Product Designer", date: "Aug 12" },
  { name: "Omar Fahmy", role: "Backend Engineer", date: "Aug 18" },
  { name: "Lina Hassan", role: "Marketing", date: "Aug 24" },
];

const onLeave = [
  { name: "Ahmed Nasser", role: "Engineer", date: "Aug 12 – 16" },
  { name: "Mousse Adel", role: "Designer", date: "Aug 06 – 08" },
  { name: "Youssef Samir", role: "Sales", date: "Aug 07 – 14" },
];

const newHires = [
  { name: "Karim El-Shazly", role: "QA Engineer", date: "Aug 04" },
  { name: "Nour Ezzat", role: "Account Manager", date: "Aug 02" },
];

export function UpcomingWidgets() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Cake className="h-4 w-4 text-primary" /> Birthdays
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {birthdays.map((b) => (
            <div key={b.name} className="flex items-center gap-3">
              <Avatar name={b.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{b.name}</p>
                <p className="truncate text-xs text-muted-foreground">{b.role}</p>
              </div>
              <span className="text-xs text-muted-foreground">{b.date}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarClock className="h-4 w-4 text-warning" /> On Leave
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {onLeave.map((l) => (
            <div key={l.name} className="flex items-center gap-3">
              <Avatar name={l.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.name}</p>
                <p className="truncate text-xs text-muted-foreground">{l.role} • {l.date}</p>
              </div>
              <Badge variant="warning">Leave</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <UserPlus className="h-4 w-4 text-success" /> New Hires
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {newHires.map((h) => (
            <div key={h.name} className="flex items-center gap-3">
              <Avatar name={h.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{h.name}</p>
                <p className="truncate text-xs text-muted-foreground">{h.role}</p>
              </div>
              <span className="text-xs text-muted-foreground">{h.date}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}