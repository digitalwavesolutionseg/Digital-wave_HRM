import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeesLoading() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-[400px] rounded-[16px]" />
    </div>
  );
}