import React from "react";

interface SkeletonComponentProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonComponentProps) {
  return (
    <div className={`animate-pulse bg-gray-800 rounded-md ${className}`} style={style} />
  );
}

export function SkeletonCard({ className = "" }: SkeletonComponentProps) {
  return (
    <div className={`p-6 rounded-xl border border-gray-800 bg-gray-900/50 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

export function SkeletonChart({ className = "" }: SkeletonComponentProps) {
  return (
    <div className={`p-6 rounded-xl border border-gray-800 bg-gray-900/50 flex flex-col gap-4 ${className}`}>
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="w-full flex items-end gap-2 h-64">
        {[40, 70, 30, 85, 50, 60, 20, 90, 45, 65, 35, 75].map((height, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t-sm" 
            style={{ height: `${height}%` }} 
          />
        ))}
      </div>
    </div>
  );
}
