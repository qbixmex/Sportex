export const PlayoffMatchesSkeleton = () => {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="w-full grid grid-cols-2 gap-5 lg:hidden">
        {Array.from({ length: 2 }).map((_, col) => (
          <div key={`${col}-col`} className="bg-gray-500 w-full h-8 rounded" />
        ))}
        {Array.from({ length: 2 }).map((_, row) => (
          <div key={`${row}-row`} className="grid grid-cols-1 gap-3">
            {Array.from({ length: 3 }).map((_, col) => (
              <div key={`${col}-col`} className="bg-gray-500 w-full h-10 rounded" />
            ))}
          </div>
        ))}
      </div>
      <div className="hidden lg:w-full lg:grid lg:grid-cols-[300px_repeat(7,1fr)] lg:gap-5">
        {Array.from({ length: 8 }).map((_, col) => (
          <div key={`${col}-col`} className="bg-gray-500 w-full h-8 rounded" />
        ))}
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={`${row}-row`} className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, col) => (
              <div key={`${col}-col`} className="bg-gray-500 w-full h-10 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
