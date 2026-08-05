import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
        <Skeleton className="h-[400px] rounded-[16px]" />
        <div className="space-y-6">
          <Skeleton className="h-[420px] rounded-[20px]" />
          <Skeleton className="h-[260px] rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}