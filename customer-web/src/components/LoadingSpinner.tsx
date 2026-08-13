import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 space-y-4">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-slate-500 font-medium animate-pulse">Loading delicious food...</p>
    </div>
  );
};
