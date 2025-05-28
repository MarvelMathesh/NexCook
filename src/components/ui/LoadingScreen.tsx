import React from 'react';

interface LoadingScreenProps {
  message?: string;
  details?: string[];
}

/**
 * Loading screen component with animated indicators
 */
export function LoadingScreen({ 
  message = 'Loading...', 
  details = [] 
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        {/* Main Loading Animation */}
        <div className="mb-8">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-2xl font-bold text-white mb-6">
          {message}
        </h1>

        {/* Loading Details */}
        {details.length > 0 && (
          <div className="space-y-3">
            {details.map((detail, index) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" 
                     style={{ animationDelay: `${index * 0.2}s` }} />
                <span className="text-gray-300 text-sm">{detail}</span>
              </div>
            ))}
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}