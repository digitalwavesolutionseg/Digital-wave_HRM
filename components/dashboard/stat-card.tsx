"use client";

import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  delta?: string;
  changeType?: "up" | "down";
  icon: React.ReactNode;
  iconClassName?: string;
  href?: string;
}

export function StatCard({
  title,
  value,
  delta,
  changeType = "up",
  icon,
  iconClassName,
  href,
}: StatCardProps) {
  const Trend = changeType === "up" ? TrendingUp : TrendingDown;
  const className =
    "group relative block overflow-hidden rounded-[20px] border border-border bg-card text-card-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.09)]";

  const content = (
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
          {delta && (
            <p className="mt-2 flex items-center gap-1 text-xs font-medium">
              <Trend
                className={cn(
                  "h-3.5 w-3.5",
                  changeType === "up" ? "text-success" : "text-destructive"
                )}
              />
              <span className={changeType === "up" ? "text-success" : "text-destructive"}>
                {delta}
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary/8 text-primary",
            iconClassName
          )}
        >
          {icon}
        </div>
      </div>
    </CardContent>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}