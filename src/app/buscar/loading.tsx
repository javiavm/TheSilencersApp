import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="container py-10">
      <Skeleton className="h-9 w-32 mb-3" />
      <Skeleton className="h-12 w-full mb-8" />
      <div className="grid gap-8 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
