/**
 * Constants for textures used in the application
 */

export type TextureDefinition = {
  id: string;
  name: string;
  path: string;
  scale: number;
  description?: string;
  category: 'wall' | 'moulding' | 'accent' | 'floor';
};

// Wall textures
export const wallTextures: TextureDefinition[] = [
  {
    id: 'plain',
    name: 'Plain',
    path: '/textures/walls/plain-wall.jpg',
    scale: 1,
    description: 'Simple painted wall texture',
    category: 'wall'
  },
  {
    id: 'stucco',
    name: 'Stucco',
    path: '/textures/walls/stucco.jpg',
    scale: 0.5,
    description: 'Textured stucco finish',
    category: 'wall'
  },
  {
    id: 'concrete',
    name: 'Concrete',
    path: '/textures/walls/concrete.jpg',
    scale: 0.3,
    description: 'Modern concrete finish',
    category: 'wall'
  }
];

// Moulding textures
export const mouldingTextures: TextureDefinition[] = [
  {
    id: 'wood-light',
    name: 'Light Wood',
    path: '/textures/moulding/wood-light.jpg',
    scale: 0.2,
    description: 'Light oak wood texture',
    category: 'moulding'
  },
  {
    id: 'wood-dark',
    name: 'Dark Wood',
    path: '/textures/moulding/wood-dark.jpg',
    scale: 0.2,
    description: 'Dark walnut wood texture',
    category: 'moulding'
  },
  {
    id: 'white-painted',
    name: 'White Painted',
    path: '/textures/moulding/white-painted.jpg',
    scale: 0.3,
    description: 'Classic white painted finish',
    category: 'moulding'
  },
  {
    id: 'metal',
    name: 'Metal',
    path: '/textures/moulding/metal.jpg',
    scale: 0.1,
    description: 'Modern metal trim',
    category: 'moulding'
  }
];

// Floor textures (used in 3D view)
export const floorTextures: TextureDefinition[] = [
  {
    id: 'hardwood',
    name: 'Hardwood',
    path: '/textures/floors/hardwood.jpg',
    scale: 0.2,
    description: 'Classic hardwood flooring',
    category: 'floor'
  },
  {
    id: 'tile',
    name: 'Tile',
    path: '/textures/floors/tile.jpg',
    scale: 0.2,
    description: 'Ceramic tile flooring',
    category: 'floor'
  }
];

// For development/testing - using placeholder URLs until we have actual texture files
export const PLACEHOLDER_TEXTURES = {
  // Wall textures
  'plain-wall': 'https://i.imgur.com/3eJwvLC.jpg',
  'stucco': 'https://i.imgur.com/wFsVjbG.jpg',
  'concrete': 'https://i.imgur.com/JKhBGEA.jpg',
  
  // Wood textures for moulding
  'wood-light': 'https://i.imgur.com/KkPnkve.jpg',
  'wood-dark': 'https://i.imgur.com/UMzmP8N.jpg',
  'white-painted': 'https://i.imgur.com/s6Fl6oJ.jpg',
  'metal': 'https://i.imgur.com/Fvn7W6l.jpg',
  
  // Floor textures
  'hardwood': 'https://i.imgur.com/gfGEeGh.jpg',
  'tile': 'https://i.imgur.com/5j3qoWb.jpg'
}; 