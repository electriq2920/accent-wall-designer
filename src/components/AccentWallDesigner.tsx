'use client';

import { useState } from 'react';
import WallVisualizer from './WallVisualizer';
import RoomVisualizer from './RoomVisualizer';
import DimensionsForm from './DimensionsForm';
import MouldingSelector from './MouldingSelector';
import ColorPicker from './ColorPicker';
import DownloadButton from './DownloadButton';
import AdBanner from './AdBanner';

export type WallConfig = {
  width: number;
  height: number;
  mouldingType: string;
  color: string;
};

export default function AccentWallDesigner() {
  const [wallConfig, setWallConfig] = useState<WallConfig>({
    width: 10,
    height: 8,
    mouldingType: 'classic',
    color: '#ffffff',
  });
  
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  const updateDimensions = (width: number, height: number) => {
    setWallConfig({ ...wallConfig, width, height });
  };

  const updateMoulding = (mouldingType: string) => {
    setWallConfig({ ...wallConfig, mouldingType });
  };

  const updateColor = (color: string) => {
    setWallConfig({ ...wallConfig, color });
  };
  
  const toggleViewMode = () => {
    setViewMode(prev => prev === '2d' ? '3d' : '2d');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Accent Wall Designer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Wall Preview</h3>
            <button
              onClick={toggleViewMode}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
            >
              {viewMode === '2d' ? 'View in 3D Room' : 'View in 2D'}
            </button>
          </div>
          
          {viewMode === '2d' ? (
            <WallVisualizer config={wallConfig} />
          ) : (
            <RoomVisualizer config={wallConfig} />
          )}
        </div>
        
        <div className="space-y-6">
          <DimensionsForm 
            width={wallConfig.width} 
            height={wallConfig.height} 
            onUpdate={updateDimensions} 
          />
          
          <MouldingSelector 
            selected={wallConfig.mouldingType} 
            onSelect={updateMoulding} 
          />
          
          <ColorPicker 
            color={wallConfig.color} 
            onSelect={updateColor} 
          />
          
          <DownloadButton config={wallConfig} />
        </div>
      </div>
      
      <div className="mt-12">
        <AdBanner />
      </div>
    </div>
  );
} 