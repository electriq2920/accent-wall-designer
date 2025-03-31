'use client';

import { useState, useEffect } from 'react';

interface ColorPickerProps {
  color: string;
  onSelect: (color: string) => void;
}

export default function ColorPicker({ color, onSelect }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(color);
  
  useEffect(() => {
    setSelectedColor(color);
  }, [color]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedColor(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelect(selectedColor);
  };

  // Predefined color options
  const presetColors = [
    '#FFFFFF', // White
    '#F5F5F5', // Off-white
    '#E6E6FA', // Lavender
    '#E0FFFF', // Light Cyan
    '#87CEFA', // Light Sky Blue
    '#98FB98', // Pale Green
    '#FFDAB9', // Peach
    '#FFB6C1', // Light Pink
    '#D3D3D3', // Light Gray
    '#FAEBD7', // Antique White
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Wall Color</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-4">
          <div 
            className="w-10 h-10 rounded border border-gray-300" 
            style={{ backgroundColor: selectedColor }}
          />
          <input
            type="color"
            value={selectedColor}
            onChange={handleColorChange}
            className="h-10 w-full cursor-pointer"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Color code
          </label>
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-1">
            Preset Colors
          </p>
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((presetColor) => (
              <div
                key={presetColor}
                className={`w-8 h-8 rounded-full cursor-pointer border hover:scale-110 transition ${
                  selectedColor === presetColor ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-300'
                }`}
                style={{ backgroundColor: presetColor }}
                onClick={() => setSelectedColor(presetColor)}
              />
            ))}
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Apply Color
        </button>
      </form>
    </div>
  );
} 