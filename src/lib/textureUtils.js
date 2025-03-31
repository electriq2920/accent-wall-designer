/**
 * Texture utilities for wall visualization
 */

/**
 * Load a texture from a URL
 * @param {string} url - URL of the texture image
 * @returns {Promise<HTMLImageElement>} - Loaded image
 */
export const loadTexture = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load texture: ${url}`));
    img.src = url;
  });
};

/**
 * Apply a texture to a rectangle with optional tinting
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} texture - Texture image
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {Object} options - Options
 * @param {number} options.scale - Scale factor for the texture (default: 1)
 * @param {string} options.tint - Color to tint the texture with (default: none)
 * @param {number} options.opacity - Opacity of the texture (default: 1)
 */
export const applyTexture = (ctx, texture, x, y, width, height, options = {}) => {
  const { scale = 1, tint, opacity = 1 } = options;
  
  ctx.save();
  
  // Handle tinting
  if (tint) {
    // Create a temporary canvas for tinting
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = texture.width;
    tempCanvas.height = texture.height;
    
    // Draw the texture on temp canvas
    tempCtx.drawImage(texture, 0, 0, texture.width, texture.height);
    
    // Apply tint using 'source-atop' composite operation
    tempCtx.globalCompositeOperation = 'source-atop';
    tempCtx.fillStyle = tint;
    tempCtx.globalAlpha = 0.7; // Allow some texture to show through
    tempCtx.fillRect(0, 0, texture.width, texture.height);
    
    // Use the tinted texture
    ctx.globalAlpha = opacity;
    
    // Create a pattern with the tinted texture
    const pattern = ctx.createPattern(tempCanvas, 'repeat');
    
    // Apply scaling transformation to the pattern
    const matrix = new DOMMatrix();
    matrix.scaleSelf(scale, scale);
    pattern.setTransform(matrix);
    
    ctx.fillStyle = pattern;
    ctx.fillRect(x, y, width, height);
  } else {
    // No tinting, just use the texture directly
    ctx.globalAlpha = opacity;
    
    // Create a pattern with the texture
    const pattern = ctx.createPattern(texture, 'repeat');
    
    // Apply scaling transformation to the pattern
    const matrix = new DOMMatrix();
    matrix.scaleSelf(scale, scale);
    pattern.setTransform(matrix);
    
    ctx.fillStyle = pattern;
    ctx.fillRect(x, y, width, height);
  }
  
  ctx.restore();
};

/**
 * Apply lighting effect to simulate 3D on a rectangle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {Object} options - Options
 * @param {string} options.lightDirection - Direction of light ('top', 'left', 'right', 'bottom')
 * @param {number} options.intensity - Light intensity (0-1)
 * @param {number} options.ambientLight - Ambient light level (0-1)
 */
export const applyLighting = (ctx, x, y, width, height, options = {}) => {
  const { 
    lightDirection = 'top-left', 
    intensity = 0.3,
    ambientLight = 0.7
  } = options;
  
  ctx.save();
  
  // Calculate gradient parameters based on light direction
  let gradientX0, gradientY0, gradientX1, gradientY1;
  
  switch (lightDirection) {
    case 'top':
      gradientX0 = x + width / 2;
      gradientY0 = y;
      gradientX1 = x + width / 2;
      gradientY1 = y + height;
      break;
    case 'right':
      gradientX0 = x + width;
      gradientY0 = y + height / 2;
      gradientX1 = x;
      gradientY1 = y + height / 2;
      break;
    case 'bottom':
      gradientX0 = x + width / 2;
      gradientY0 = y + height;
      gradientX1 = x + width / 2;
      gradientY1 = y;
      break;
    case 'left':
      gradientX0 = x;
      gradientY0 = y + height / 2;
      gradientX1 = x + width;
      gradientY1 = y + height / 2;
      break;
    case 'top-left':
      gradientX0 = x;
      gradientY0 = y;
      gradientX1 = x + width;
      gradientY1 = y + height;
      break;
    case 'top-right':
      gradientX0 = x + width;
      gradientY0 = y;
      gradientX1 = x;
      gradientY1 = y + height;
      break;
    case 'bottom-right':
      gradientX0 = x + width;
      gradientY0 = y + height;
      gradientX1 = x;
      gradientY1 = y;
      break;
    case 'bottom-left':
      gradientX0 = x;
      gradientY0 = y + height;
      gradientX1 = x + width;
      gradientY1 = y;
      break;
    default:
      // Default to top-left
      gradientX0 = x;
      gradientY0 = y;
      gradientX1 = x + width;
      gradientY1 = y + height;
      break;
  }
  
  // Create gradient
  const gradient = ctx.createLinearGradient(gradientX0, gradientY0, gradientX1, gradientY1);
  
  // Adjust gradient stops based on intensity and ambient light
  const lightVal = Math.min(1, ambientLight + intensity);
  const darkVal = Math.max(0, ambientLight - intensity);
  
  gradient.addColorStop(0, `rgba(255, 255, 255, ${lightVal})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, ${darkVal})`);
  
  // Apply the gradient with overlay blend mode
  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
  
  ctx.restore();
};

/**
 * Create a 3D edge effect for a rectangle
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Width
 * @param {number} height - Height
 * @param {number} depth - Depth of the 3D effect
 */
export const create3DEdgeEffect = (ctx, x, y, width, height, depth = 2) => {
  ctx.save();
  
  // Top edge highlight
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = depth;
  ctx.stroke();
  
  // Left edge highlight
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + height);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.stroke();
  
  // Bottom edge shadow
  ctx.beginPath();
  ctx.moveTo(x, y + height);
  ctx.lineTo(x + width, y + height);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.stroke();
  
  // Right edge shadow
  ctx.beginPath();
  ctx.moveTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.stroke();
  
  ctx.restore();
}; 