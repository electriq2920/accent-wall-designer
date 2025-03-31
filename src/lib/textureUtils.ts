/**
 * Texture utilities for Canvas-based visualizers
 */

// Cache for loaded textures to avoid reloading
const textureCache: Record<string, HTMLImageElement> = {};

/**
 * Load a texture image and return it when loaded
 */
export function loadTexture(src: string): Promise<HTMLImageElement> {
  // Return from cache if available
  if (textureCache[src]) {
    return Promise.resolve(textureCache[src]);
  }
  
  // Load the texture
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Needed for some external images
    
    img.onload = () => {
      textureCache[src] = img;
      resolve(img);
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load texture: ${src}`));
    };
    
    img.src = src;
  });
}

/**
 * Apply a texture to a rectangular area
 */
export function applyTexture(
  ctx: CanvasRenderingContext2D, 
  texture: HTMLImageElement,
  x: number, 
  y: number, 
  width: number, 
  height: number,
  options: {
    scale?: number;
    opacity?: number;
    tint?: string;
    angle?: number;
  } = {}
) {
  const { scale = 1, opacity = 1, tint, angle = 0 } = options;
  
  // Save the current context state
  ctx.save();
  
  // Set global alpha for opacity
  ctx.globalAlpha = opacity;
  
  // Handle rotation if specified
  if (angle !== 0) {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    ctx.translate(-centerX, -centerY);
  }
  
  // Draw the texture
  const patternWidth = texture.width * scale;
  const patternHeight = texture.height * scale;
  
  // Create a pattern for tiling
  const pattern = ctx.createPattern(texture, 'repeat');
  
  if (pattern) {
    // Apply the pattern
    ctx.fillStyle = pattern;
    ctx.fillRect(x, y, width, height);
    
    // Apply tint if specified
    if (tint) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = tint;
      ctx.globalAlpha = 0.3; // Tint intensity
      ctx.fillRect(x, y, width, height);
    }
  }
  
  // Restore the context state
  ctx.restore();
}

/**
 * Create a lighting effect that simulates depth
 */
export function applyLighting(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    lightDirection?: 'top' | 'left' | 'right' | 'bottom';
    intensity?: number;
    ambientLight?: number;
  } = {}
) {
  const { 
    lightDirection = 'top-left',
    intensity = 0.4,
    ambientLight = 0.7
  } = options;
  
  // Create gradient based on light direction
  let gradient;
  switch (lightDirection) {
    case 'top':
      gradient = ctx.createLinearGradient(x, y, x, y + height);
      break;
    case 'left':
      gradient = ctx.createLinearGradient(x, y, x + width, y);
      break;
    case 'right':
      gradient = ctx.createLinearGradient(x + width, y, x, y);
      break;
    case 'bottom':
      gradient = ctx.createLinearGradient(x, y + height, x, y);
      break;
    default:
      gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  }
  
  // Set gradient colors for lighting effect
  gradient.addColorStop(0, `rgba(255, 255, 255, ${intensity})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
  
  // Apply ambient light
  ctx.save();
  ctx.globalAlpha = ambientLight;
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = 'white';
  ctx.fillRect(x, y, width, height);
  
  // Apply directional light
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  
  // Restore context
  ctx.restore();
}

/**
 * Create a 3D edge effect
 */
export function create3DEdgeEffect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number = 5,
  color: string = '#333333'
) {
  // Save context
  ctx.save();
  
  // Shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = depth;
  ctx.shadowOffsetX = depth;
  ctx.shadowOffsetY = depth;
  
  // Draw the main rectangle
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  
  // Clear shadow for the highlight
  ctx.shadowColor = 'transparent';
  
  // Draw highlight on top-left edges
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.stroke();
  
  // Restore context
  ctx.restore();
} 