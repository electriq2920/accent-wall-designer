'use client';

import { useState } from 'react';

// Verified texture URLs that work
const TEXTURES = {
  wall: [
    {
      id: 'plain-white',
      name: 'Plain White',
      path: 'https://images.unsplash.com/photo-1558882224-dda166733046?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'concrete',
      name: 'Concrete',
      path: 'https://images.unsplash.com/photo-1616690248363-699206e0e567?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'stucco',
      name: 'Stucco',
      path: 'https://images.unsplash.com/photo-1619195308322-b93abf6107ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    }
  ],
  moulding: [
    {
      id: 'white-painted',
      name: 'White Painted',
      path: 'https://images.unsplash.com/photo-1594285766171-90a3f24d233c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'wood-light',
      name: 'Light Wood',
      path: 'https://images.unsplash.com/photo-1566312756089-9df6bc5247a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'wood-dark',
      name: 'Dark Wood',
      path: 'https://images.unsplash.com/photo-1585314300269-7d285a09657e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    }
  ],
  floor: [
    {
      id: 'hardwood',
      name: 'Hardwood',
      path: 'https://images.unsplash.com/photo-1541998464-28b04490f2a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'tile',
      name: 'Tile',
      path: 'https://images.unsplash.com/photo-1557253039-499388d93232?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'marble',
      name: 'Marble',
      path: 'https://images.unsplash.com/photo-1586268702476-182e36bbc50e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    }
  ]
};

export default function TextureSelector({ onSelectTexture, activeCategory = 'wall' }) {
  const [category, setCategory] = useState(activeCategory);
  
  // Get textures based on current category
  const getTexturesForCategory = () => {
    return TEXTURES[category] || TEXTURES.wall;
  };
  
  const handleSelectTexture = (texturePath) => {
    onSelectTexture(category, texturePath);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-3">Textures</h3>
      
      {/* Category tabs */}
      <div className="flex border-b mb-3">
        <button 
          className={`px-3 py-2 ${category === 'wall' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setCategory('wall')}
        >
          Wall
        </button>
        <button 
          className={`px-3 py-2 ${category === 'moulding' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setCategory('moulding')}
        >
          Moulding
        </button>
        <button 
          className={`px-3 py-2 ${category === 'floor' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          onClick={() => setCategory('floor')}
        >
          Floor
        </button>
      </div>
      
      {/* Texture grid */}
      <div className="grid grid-cols-3 gap-3">
        {getTexturesForCategory().map(texture => (
          <div 
            key={texture.id}
            className="texture-item cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleSelectTexture(texture.path)}
          >
            <div 
              className="w-full aspect-square rounded border overflow-hidden bg-gray-100 mb-1"
              style={{
                backgroundImage: `url('${texture.path}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <p className="text-xs text-center">{texture.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 