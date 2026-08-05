import { Skeleton } from "@/components/ui/skeleton";

export default function PositionsLoading() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-[84px] rounded-[20px]" />
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-64 rounded-[14px]" />
          <Skeleton className="h-10 w-48 rounded-[14px]" />
          <Skeleton className="h-10 w-40 rounded-[14px]" />
        </div>
        <Skeleton className="h-[360px] rounded-[16px]" />
      </div>
    </div>
  );
}