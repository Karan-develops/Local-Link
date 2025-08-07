import React from "react";
import { Skeleton } from "./ui/skeleton";

const CardSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-[250px] bg-gray-800 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px] bg-gray-800" />
            <Skeleton className="h-4 w-[200px] bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;
