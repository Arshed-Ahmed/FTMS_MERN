import React from 'react';
import Sidebar from './Sidebar';
import Skeleton from './Skeleton';
import { useAuth } from '../context/AuthContext';

const LayoutSkeleton = () => {
  const { userInfo } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden transition-colors duration-200">
      {userInfo && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10 shrink-0 transition-colors duration-200">
          <div className="flex justify-between items-center px-8 py-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex items-center space-x-4">
               <Skeleton className="h-8 w-8 rounded-full" />
               <Skeleton className="h-8 w-8 rounded-full" />
               <Skeleton className="h-8 w-32 rounded-full" />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-8">
           <div className="max-w-4xl mx-auto space-y-6">
             <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
               <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-24 w-full" />
                 </div>
                 <div className="flex justify-end space-x-4 pt-4">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-32" />
                 </div>
               </div>
             </div>
           </div>
        </main>
      </div>
    </div>
  );
};

export default LayoutSkeleton;
