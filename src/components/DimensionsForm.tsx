'use client';

import { useState } from 'react';

interface DimensionsFormProps {
  width: number;
  height: number;
  onUpdate: (width: number, height: number) => void;
}

export default function DimensionsForm({ width, height, onUpdate }: DimensionsFormProps) {
  const [formWidth, setFormWidth] = useState(width);
  const [formHeight, setFormHeight] = useState(height);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formWidth, formHeight);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Wall Dimensions</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
              Width (feet)
            </label>
            <input
              type="number"
              id="width"
              min="1"
              max="30"
              step="0.5"
              value={formWidth}
              onChange={(e) => setFormWidth(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
              Height (feet)
            </label>
            <input
              type="number"
              id="height"
              min="1"
              max="20"
              step="0.5"
              value={formHeight}
              onChange={(e) => setFormHeight(Number(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Update Dimensions
          </button>
        </div>
      </form>
    </div>
  );
} 