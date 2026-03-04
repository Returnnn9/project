"use client"
import React from "react"

export const Skeleton = ({ className }: { className?: string }) => (
 <div className={`animate-pulse bg-smusl-clay/40 rounded-xl ${className}`} />
)

export const ProductCardSkeleton = () => (
 <div className="bg-white rounded-[2.5rem] border border-smusl-light-gray p-6 flex flex-col gap-6">
  <Skeleton className="aspect-square w-full rounded-[2rem]" />
  <div className="flex-1 space-y-4">
   <div className="flex justify-between items-start gap-4">
    <div className="flex-1 space-y-2">
     <Skeleton className="h-5 w-3/4" />
     <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="text-right space-y-2">
     <Skeleton className="h-5 w-16" />
     <Skeleton className="h-3 w-12 ml-auto" />
    </div>
   </div>
   <Skeleton className="h-14 w-full rounded-[1.2rem]" />
  </div>
 </div>
)

export const OrderSkeleton = () => (
 <div className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_2fr_1fr_1fr] items-center px-6 py-8 bg-white border border-smusl-light-gray rounded-[2rem] gap-4">
  <div className="space-y-2">
   <Skeleton className="h-4 w-3/4" />
   <Skeleton className="h-3 w-1/2" />
  </div>
  <Skeleton className="h-4 w-1/3" />
  <Skeleton className="h-4 w-1/2" />
  <Skeleton className="h-6 w-16" />
  <Skeleton className="h-10 w-32 rounded-xl" />
 </div>
)
