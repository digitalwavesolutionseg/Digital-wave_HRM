import { Skeleton } from "@/components/ui/skeleton";

export default function PayrollLoading() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-40 rounded-[14px]" />
          <Skeleton className="h-10 w-32 rounded-[14px]" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-[20px]" />
        ))}
      </div>
      <Skeleton className="h-[340px] rounded-[20px]" />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-8 w-24 rounded-[12px]" />
        </div>
        <Skeleton className="h-[360px] rounded-[16px]" />
      </div>
    </div>
  );
}
