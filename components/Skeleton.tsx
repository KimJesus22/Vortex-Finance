"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export function Skeleton({ className, width, height, borderRadius = "1rem" }: SkeletonProps) {
  return (
    <div
      className={`animate-skeleton ${className}`}
      style={{
        width: width ?? "100%",
        height: height ?? "1rem",
        borderRadius,
      }}
    />
  );
}

export function TransactionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex justify-between items-center p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center gap-4">
            <Skeleton width={48} height={48} borderRadius="0.75rem" />
            <div className="flex flex-col gap-2">
              <Skeleton width={120} height={20} />
              <Skeleton width={80} height={14} />
            </div>
          </div>
          <Skeleton width={100} height={28} />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 h-80 flex flex-col items-center justify-center gap-6">
        <Skeleton width="60%" height={20} />
        <div className="relative w-48 h-48">
           <Skeleton width="100%" height="100%" borderRadius="50%" />
           <div className="absolute inset-4 bg-neutral-950 rounded-full"></div>
        </div>
        <Skeleton width="40%" height={16} />
      </div>
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 h-80 flex flex-col gap-6">
        <Skeleton width="40%" height={20} className="mx-auto" />
        <div className="flex-grow flex items-end justify-around gap-4 px-4">
          <Skeleton width={60} height="80%" borderRadius="0.5rem" />
          <Skeleton width={60} height="50%" borderRadius="0.5rem" />
          <Skeleton width={60} height="70%" borderRadius="0.5rem" />
          <Skeleton width={60} height="30%" borderRadius="0.5rem" />
        </div>
      </div>
    </div>
  );
}

export function BalanceSkeleton() {
  return (
    <div className="bg-neutral-900 rounded-3xl p-8 md:p-10 border border-neutral-800 text-center flex flex-col items-center gap-4">
      <Skeleton width={150} height={20} />
      <Skeleton width={300} height={70} borderRadius="1.5rem" />
    </div>
  );
}
