import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

const ServerDownPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-6 rounded-full">
            <WifiOff className="w-16 h-16 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Server is Offline
        </h1>
        
        <p className="text-gray-600 mb-8 text-lg">
          We're having trouble connecting to the server. It might be taking a nap or your internet connection is unstable.
        </p>

        <button 
          onClick={() => window.location.reload()} 
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Retry Connection
        </button>
      </div>
      
      <div className="mt-12 text-sm text-gray-400">
        Error Code: NETWORK_ERR_CONNECTION_REFUSED
      </div>
    </div>
  );
};

export default ServerDownPage;
