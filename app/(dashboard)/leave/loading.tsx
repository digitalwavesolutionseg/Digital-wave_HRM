import { Skeleton } from "@/components/ui/skeleton";

export default function LeaveLoading() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[130px] rounded-[20px]" />
        ))}
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[150px] rounded-[16px]" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-[360px] rounded-[16px]" />
      </div>
    </div>
  );
}