'use client';

import { useState } from 'react';
import EnhancedRoomVisualizer from '@/components/EnhancedRoomVisualizer';

// Room type presets
const ROOM_TYPES = {
  LIVING_ROOM: 'livingRoom',
  BEDROOM: 'bedroom',
  OFFICE: 'office',
  DINING_ROOM: 'diningRoom'
};

export default function ThreeDVisualizerPage() {
  const [config, setConfig] = useState({
    width: 12,
    height: 10,
    accentWallColor: '#e6e2dd',
    sideWallColor: '#f5f5f5',
    mouldingColor: '#ffffff',
    mouldingType: 'classic',
    mouldingWidth: 0.05,
    patternRepeats: {
      horizontal: 1,
      vertical: 1
    },
    roomType: ROOM_TYPES.LIVING_ROOM
  });
  
  const handleConfigChange = (field, value) => {
    setConfig({ ...config, [field]: value });
  };
  
  const handlePatternRepeatsChange = (direction, value) => {
    setConfig({
      ...config,
      patternRepeats: {
        ...config.patternRepeats,
        [direction]: value
      }
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">3D Accent Wall Visualizer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-3">Wall Configuration</h3>
            
            <div className="space-y-4">
              {/* Width input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width (ft)</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="8"
                    max="20"
                    value={config.width}
                    onChange={(e) => handleConfigChange('width', Number(e.target.value))}
                    className="w-full mr-2"
                  />
                  <span className="text-sm font-medium">{config.width}</span>
                </div>
              </div>
              
              {/* Height input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (ft)</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="8"
                    max="16"
                    value={config.height}
                    onChange={(e) => handleConfigChange('height', Number(e.target.value))}
                    className="w-full mr-2"
                  />
                  <span className="text-sm font-medium">{config.height}</span>
                </div>
              </div>
              
              {/* Color inputs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accent Wall Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={config.accentWallColor}
                    onChange={(e) => handleConfigChange('accentWallColor', e.target.value)}
                    className="h-8 w-8 border rounded"
                  />
                  <span className="text-sm">{config.accentWallColor}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Side Wall Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={config.sideWallColor}
                    onChange={(e) => handleConfigChange('sideWallColor', e.target.value)}
                    className="h-8 w-8 border rounded"
                  />
                  <span className="text-sm">{config.sideWallColor}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moulding Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={config.mouldingColor}
                    onChange={(e) => handleConfigChange('mouldingColor', e.target.value)}
                    className="h-8 w-8 border rounded"
                  />
                  <span className="text-sm">{config.mouldingColor}</span>
                </div>
              </div>
              
              {/* Moulding type selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moulding Type</label>
                <select
                  value={config.mouldingType}
                  onChange={(e) => handleConfigChange('mouldingType', e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                >
                  <option value="classic">Classic</option>
                  <option value="modern">Modern</option>
                  <option value="geometric">Geometric</option>
                  <option value="minimal">Minimal</option>
                  <option value="grid">Grid</option>
                  <option value="diamond">Diamond</option>
                  <option value="chevron">Chevron</option>
                  <option value="rectangular">Rectangular</option>
                </select>
              </div>
              
              {/* Moulding width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moulding Width</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={config.mouldingWidth * 100}
                    onChange={(e) => handleConfigChange('mouldingWidth', Number(e.target.value) / 100)}
                    className="w-full mr-2"
                  />
                  <span className="text-sm font-medium">{(config.mouldingWidth * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              {/* Pattern repeats */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horizontal Pattern Repeats</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={config.patternRepeats.horizontal}
                    onChange={(e) => handlePatternRepeatsChange('horizontal', Number(e.target.value))}
                    className="w-full mr-2"
                  />
                  <span className="text-sm font-medium">{config.patternRepeats.horizontal}</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vertical Pattern Repeats</label>
                <div className="flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={config.patternRepeats.vertical}
                    onChange={(e) => handlePatternRepeatsChange('vertical', Number(e.target.value))}
                    className="w-full mr-2"
                  />
                  <span className="text-sm font-medium">{config.patternRepeats.vertical}</span>
                </div>
              </div>
              
              {/* Room type selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                <select
                  value={config.roomType}
                  onChange={(e) => handleConfigChange('roomType', e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                >
                  <option value={ROOM_TYPES.LIVING_ROOM}>Living Room</option>
                  <option value={ROOM_TYPES.BEDROOM}>Bedroom</option>
                  <option value={ROOM_TYPES.OFFICE}>Office</option>
                  <option value={ROOM_TYPES.DINING_ROOM}>Dining Room</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-span-1 lg:col-span-3">
          <EnhancedRoomVisualizer config={config} />
          
          <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Tips for 3D View</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Click and drag to rotate the view</li>
              <li>Use the scroll wheel to zoom in and out</li>
              <li>Use the view buttons to quickly switch perspectives</li>
              <li>Try different moulding styles with varying pattern repeats</li>
              <li>Explore different room setups with the room type selector</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 