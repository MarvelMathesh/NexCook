import React from 'react';
import { useAppStore } from '../../store/appStore';

/**
 * System Status Indicator showing hardware and connection status
 */
export function SystemStatusIndicator() {
  const { 
    esp32Connected, 
    firebaseConnected, 
    isOnline,
    systemStatus 
  } = useAppStore();

  const getOverallStatus = () => {
    if (!isOnline) return 'offline';
    if (!esp32Connected) return 'hardware-error';
    if (!firebaseConnected) return 'cloud-error';
    return 'online';
  };

  const getStatusColor = () => {
    switch (getOverallStatus()) {
      case 'online':
        return 'bg-green-500';
      case 'hardware-error':
        return 'bg-red-500';
      case 'cloud-error':
        return 'bg-yellow-500';
      case 'offline':
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (getOverallStatus()) {
      case 'online':
        return 'System Online';
      case 'hardware-error':
        return 'Hardware Disconnected';
      case 'cloud-error':
        return 'Cloud Sync Issue';
      case 'offline':
      default:
        return 'Offline';
    }
  };

  const getStatusIcon = () => {
    switch (getOverallStatus()) {
      case 'online':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'hardware-error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cloud-error':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        );
      case 'offline':
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728m0 0L5.636 18.364m12.728-12.728L18.364 18.364M5.636 5.636l12.728 12.728" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-3">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${getOverallStatus() === 'online' ? 'animate-pulse' : ''}`} />
            <span className="text-white text-sm font-medium">
              {getStatusText()}
            </span>
            <div className="text-white">
              {getStatusIcon()}
            </div>
          </div>

          {/* Detailed Status */}
          <div className="border-l border-gray-600 pl-3">
            <div className="flex space-x-3 text-xs">
              {/* ESP32 Status */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  esp32Connected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-gray-300">ESP32</span>
              </div>

              {/* Firebase Status */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  firebaseConnected ? 'bg-green-400' : 'bg-yellow-400'
                }`} />
                <span className="text-gray-300">Cloud</span>
              </div>

              {/* Network Status */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <span className="text-gray-300">Net</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status Message */}
        {systemStatus && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-400">{systemStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
}