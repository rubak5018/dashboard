import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton loader для карток днів народження
export default function BirthdaysSkeleton() {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Search skeleton */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Skeleton className="h-10 w-full max-w-md bg-muted/50" />
          <Skeleton className="h-6 w-32 bg-muted/50" />
        </div>
  
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card 
              key={i} 
              className="border-muted bg-gradient-to-br from-card to-muted/20 animate-pulse"
            >
              <CardContent className="flex flex-col items-center justify-center min-h-[240px] text-center gap-4 p-6">
                {/* Avatar skeleton */}
                <Skeleton className="w-20 h-20 rounded-full bg-muted/50" />
                
                {/* Text skeleton */}
                <div className="space-y-2 w-full">
                  <Skeleton className="h-5 w-3/4 mx-auto bg-muted/50" />
                  <Skeleton className="h-4 w-1/2 mx-auto bg-muted/50" />
                </div>
                
                {/* Button skeleton */}
                <Skeleton className="h-9 w-full max-w-[200px] mt-2 bg-muted/50 rounded-lg" />
                
                {/* Animated underline */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary/20 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }