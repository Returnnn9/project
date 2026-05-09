"use client"

export const Skeleton = ({ className }: { className?: string }) => (
 <div className={`animate-pulse bg-smusl-clay/40 rounded-xl ${className}`} />
)

export const ProductCardSkeleton = () => (
 <div className="bg-[#FAF7F5] rounded-[2.5rem] border border-[#F2F2F2] h-full flex flex-col p-3 sm:p-4 shadow-sm">
  <div className="p-1">
   <Skeleton className="aspect-[4/3] w-full rounded-[1.8rem] bg-[#F0EAE4] mb-2 sm:mb-4" />
  </div>


  <div className="flex-1 flex flex-col gap-3 sm:gap-4 px-2 xs:px-3 sm:px-4 pb-3 sm:pb-4">
   <div className="space-y-1.5 sm:space-y-2">
    <div className="flex flex-col xl:flex-row xl:items-baseline justify-between gap-1.5 xl:gap-3">
     <div className="space-y-1.5 w-full xl:w-2/3 min-h-[2.4em] flex flex-col justify-center">
      <Skeleton className="h-4 xs:h-4 sm:h-4 xl:h-5 w-full bg-[#F0EAE4] rounded-[4px]" />
      <Skeleton className="h-4 xs:h-4 sm:h-4 xl:h-5 w-2/3 bg-[#F0EAE4] rounded-[4px]" />
     </div>
     <Skeleton className="h-4 xs:h-[18px] sm:h-[18px] xl:h-[22px] w-20 bg-[#F0EAE4] rounded-[4px] mt-1" />
    </div>
    <div className="flex items-center justify-between mt-1">
     <Skeleton className="h-3 xs:h-3.5 sm:h-3.5 xl:h-4 w-8 bg-[#F0EAE4] rounded-[4px]" />
     <Skeleton className="h-3 xs:h-3.5 sm:h-[13px] xl:h-4 w-20 bg-[#F0EAE4] rounded-[4px]" />
    </div>
   </div>

   <Skeleton className="w-full h-11 xs:h-12 sm:h-13 xl:h-14 mt-auto bg-[#F0EAE4] rounded-[0.8rem] sm:rounded-[0.9rem]" />
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
