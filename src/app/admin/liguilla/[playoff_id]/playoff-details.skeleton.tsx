export const PlayoffDetailsSkeleton = () => {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="w-100 h-10 bg-gray-500 rounded-lg" />
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="flex-1 flex flex-col gap-3">
          <div className="w-100 h-8 bg-gray-500 rounded-lg" />
          {Array.from({ length: 8 }).map((_, col) => (
            <div key={`${col}-col`} className="w-50 h-7 bg-gray-500 rounded-lg" />
          ))}
        </div>
        <div className="flex-1 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, row) => (
            <div key={`${row}-row`} className="flex gap-5">
              <div className="w-25 h-7 bg-gray-500 rounded-lg" />
              <div className="flex-1 h-7 bg-gray-500 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
