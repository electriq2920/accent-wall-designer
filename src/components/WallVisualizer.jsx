'use client';

import { useEffect, useRef, useState } from 'react';
import { loadTexture, applyTexture, applyLighting, create3DEdgeEffect } from '@/lib/textureUtils';
import { PLACEHOLDER_TEXTURES } from '@/lib/textureConstants';

export default function WallVisualizer({ config }) {
  const canvasRef = useRef(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [textures, setTextures] = useState({});
  
  // Define moulding patterns
  const mouldingPatterns = {
    classic: drawClassicMoulding,
    modern: drawModernMoulding,
    geometric: drawGeometricMoulding,
    minimal: drawMinimalMoulding,
    herringbone: drawHerringboneMoulding,
    paneled: drawPaneledMoulding,
    wainscoting: drawWainscotingMoulding,
    shiplap: drawShiplapMoulding,
  };
  
  // Load textures
  useEffect(() => {
    const loadTextures = async () => {
      try {
        // Load wall texture
        const wallTexture = await loadTexture(PLACEHOLDER_TEXTURES['plain-wall']);
        
        // Load moulding texture (use white-painted as default, but this could be configurable)
        const mouldingTexture = await loadTexture(PLACEHOLDER_TEXTURES['white-painted']);
        
        setTextures({
          wall: wallTexture,
          moulding: mouldingTexture,
        });
        
        setTexturesLoaded(true);
      } catch (error) {
        console.error('Error loading textures:', error);
        // Fallback to non-textured rendering
        setTexturesLoaded(true);
      }
    };
    
    loadTextures();
  }, []);
  
  // Render when config changes or textures load
  useEffect(() => {
    if (!canvasRef.current || !texturesLoaded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the wall background with texture
    if (textures.wall) {
      // Apply wall texture with color tint
      applyTexture(ctx, textures.wall, 0, 0, canvas.width, canvas.height, {
        scale: 0.5,
        tint: config.color,
        opacity: 0.9
      });
    } else {
      // Fallback if texture loading failed
      ctx.fillStyle = config.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Add subtle lighting to the wall
    applyLighting(ctx, 0, 0, canvas.width, canvas.height, {
      lightDirection: 'top',
      intensity: 0.3,
      ambientLight: 0.8
    });
    
    // Draw moulding pattern with texture
    const mouldingType = config.mouldingType;
    if (mouldingPatterns[mouldingType]) {
      mouldingPatterns[mouldingType](ctx, canvas.width, canvas.height, config, textures);
    } else {
      mouldingPatterns.classic(ctx, canvas.width, canvas.height, config, textures);
    }
    
  }, [config, texturesLoaded, textures]);
  
  return (
    <div className="bg-gray-100 rounded-lg shadow-md p-4 h-[500px]">
      <div className="relative h-full">
        {!texturesLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70 z-10">
            <div className="text-gray-700">Loading textures...</div>
          </div>
        )}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full rounded border border-gray-300"
        />
        <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded text-sm">
          {config.width} ft × {config.height} ft
        </div>
      </div>
    </div>
  );
}

// Moulding drawing functions with textures
function drawClassicMoulding(ctx, width, height, config, textures) {
  const margin = width * 0.1;
  const outerWidth = width - margin * 2;
  const outerHeight = height - margin * 2;
  const innerWidth = width - margin * 3;
  const innerHeight = height - margin * 3;
  
  // Draw outer frame with texture and 3D effect
  if (textures.moulding) {
    // Create clipping path for the outer frame
    ctx.save();
    ctx.beginPath();
    ctx.rect(margin, margin, outerWidth, outerHeight);
    ctx.rect(margin * 1.5, margin * 1.5, innerWidth, innerHeight);
    ctx.clip('evenodd'); // 'evenodd' creates a "hole" in the path
    
    // Apply moulding texture to the frame area
    applyTexture(ctx, textures.moulding, margin, margin, outerWidth, outerHeight, {
      scale: 0.2,
    });
    
    // Add lighting effect to make it look 3D
    applyLighting(ctx, margin, margin, outerWidth, outerHeight, {
      lightDirection: 'top',
      intensity: 0.5
    });
    
    ctx.restore();
  } else {
    // Fallback to simple drawing
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 5;
    ctx.strokeRect(margin, margin, outerWidth, outerHeight);
    ctx.strokeRect(margin * 1.5, margin * 1.5, innerWidth, innerHeight);
  }
  
  // Add 3D edge effect
  create3DEdgeEffect(ctx, margin, margin, outerWidth, outerHeight, 3);
  create3DEdgeEffect(ctx, margin * 1.5, margin * 1.5, innerWidth, innerHeight, 2);
}

function drawModernMoulding(ctx, width, height, config, textures) {
  const margin = width * 0.08;
  
  if (textures.moulding) {
    // Draw horizontal lines with textures
    for (let i = 1; i < 4; i++) {
      const y = (height * i) / 4;
      const lineHeight = 10; // Thicker lines for texture
      
      // Create clipping path for the line
      ctx.save();
      ctx.beginPath();
      ctx.rect(margin, y - lineHeight/2, width - margin * 2, lineHeight);
      ctx.clip();
      
      // Apply moulding texture
      applyTexture(ctx, textures.moulding, margin, y - lineHeight/2, width - margin * 2, lineHeight, {
        scale: 0.1,
      });
      
      // Add lighting
      applyLighting(ctx, margin, y - lineHeight/2, width - margin * 2, lineHeight, {
        intensity: 0.4
      });
      
      ctx.restore();
      
      // Add 3D edge effect
      create3DEdgeEffect(ctx, margin, y - lineHeight/2, width - margin * 2, lineHeight, 2);
    }
    
    // Draw vertical line
    const lineWidth = 10;
    ctx.save();
    ctx.beginPath();
    ctx.rect(width/2 - lineWidth/2, margin, lineWidth, height - margin * 2);
    ctx.clip();
    
    applyTexture(ctx, textures.moulding, width/2 - lineWidth/2, margin, lineWidth, height - margin * 2, {
      scale: 0.1,
    });
    
    applyLighting(ctx, width/2 - lineWidth/2, margin, lineWidth, height - margin * 2, {
      intensity: 0.4
    });
    
    ctx.restore();
    
    // Add 3D edge effect
    create3DEdgeEffect(ctx, width/2 - lineWidth/2, margin, lineWidth, height - margin * 2, 2);
  } else {
    // Fallback
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 3;
    
    // Draw horizontal lines
    for (let i = 1; i < 4; i++) {
      const y = (height * i) / 4;
      ctx.beginPath();
      ctx.moveTo(margin, y);
      ctx.lineTo(width - margin, y);
      ctx.stroke();
    }
    
    // Draw vertical line
    ctx.beginPath();
    ctx.moveTo(width / 2, margin);
    ctx.lineTo(width / 2, height - margin);
    ctx.stroke();
  }
}

function drawGeometricMoulding(ctx, width, height, config, textures) {
  const margin = width * 0.1;
  const size = Math.min(width, height) * 0.15;
  
  // Create diamond pattern with texture
  if (textures.moulding) {
    for (let x = margin; x < width - margin; x += size * 2) {
      for (let y = margin; y < height - margin; y += size * 2) {
        // Create diamond path for clipping
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size * 2, y + size);
        ctx.lineTo(x + size, y + size * 2);
        ctx.closePath();
        ctx.clip();
        
        // Calculate a rectangle that encompasses the diamond
        const diamondX = x;
        const diamondY = y;
        const diamondWidth = size * 2;
        const diamondHeight = size * 2;
        
        // Apply moulding texture
        applyTexture(ctx, textures.moulding, diamondX, diamondY, diamondWidth, diamondHeight, {
          scale: 0.15
        });
        
        // Add lighting effect
        applyLighting(ctx, diamondX, diamondY, diamondWidth, diamondHeight, {
          intensity: 0.5
        });
        
        ctx.restore();
        
        // Draw diamond outline for 3D effect
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size * 2, y + size);
        ctx.lineTo(x + size, y + size * 2);
        ctx.closePath();
        
        // Add shadow for 3D effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
    }
  } else {
    // Fallback
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 3;
    
    for (let x = margin; x < width - margin; x += size * 2) {
      for (let y = margin; y < height - margin; y += size * 2) {
        ctx.beginPath();
        ctx.moveTo(x, y + size);
        ctx.lineTo(x + size, y);
        ctx.lineTo(x + size * 2, y + size);
        ctx.lineTo(x + size, y + size * 2);
        ctx.closePath();
        ctx.stroke();
      }
    }
  }
}

function drawMinimalMoulding(ctx, width, height, config, textures) {
  const margin = width * 0.15;
  const frameWidth = width - margin * 2;
  const frameHeight = height - margin * 2;
  
  if (textures.moulding) {
    // Create frame clipping path
    ctx.save();
    
    // Draw a rectangular path for the frame
    ctx.beginPath();
    ctx.rect(margin, margin, frameWidth, frameHeight);
    
    // Create a slightly smaller rectangle for the inner hole
    const innerMargin = 10; // 10px border width
    ctx.rect(margin + innerMargin, margin + innerMargin, 
             frameWidth - innerMargin * 2, frameHeight - innerMargin * 2);
    
    // Use evenodd fill rule to create a "frame" shape
    ctx.clip('evenodd');
    
    // Apply moulding texture to the frame
    applyTexture(ctx, textures.moulding, margin, margin, frameWidth, frameHeight, {
      scale: 0.15
    });
    
    // Add lighting effect
    applyLighting(ctx, margin, margin, frameWidth, frameHeight, {
      intensity: 0.4
    });
    
    ctx.restore();
    
    // Add 3D edge effect
    create3DEdgeEffect(ctx, margin, margin, frameWidth, frameHeight, 3);
  } else {
    // Fallback
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
  }
}

function drawHerringboneMoulding(ctx, width, height, config, textures) {
  const margin = width * 0.1;
  const patternSize = width * 0.05;
  
  // Draw outer frame
  if (textures.moulding) {
    // Draw outer frame with texture
    ctx.save();
    
    // Create frame clipping path
    ctx.beginPath();
    ctx.rect(margin, margin, width - margin * 2, height - margin * 2);
    
    // Create inner rectangle for the hole
    const innerMargin = 5; // 5px border width
    ctx.rect(margin + innerMargin, margin + innerMargin, 
             width - margin * 2 - innerMargin * 2, height - margin * 2 - innerMargin * 2);
    
    // Use evenodd fill rule to create a "frame" shape
    ctx.clip('evenodd');
    
    // Apply moulding texture to the frame
    applyTexture(ctx, textures.moulding, margin, margin, width - margin * 2, height - margin * 2, {
      scale: 0.15
    });
    
    // Add lighting effect
    applyLighting(ctx, margin, margin, width - margin * 2, height - margin * 2, {
      intensity: 0.4
    });
    
    ctx.restore();
    
    // Add 3D edge effect
    create3DEdgeEffect(ctx, margin, margin, width - margin * 2, height - margin * 2, 3);
    
    // Draw herringbone pattern
    for (let y = margin * 1.5; y < height - margin * 1.5; y += patternSize * 2) {
      for (let x = margin * 1.5; x < width - margin * 1.5; x += patternSize * 2) {
        // Upward diagonal
        ctx.save();
        
        // Create diagonal path
        ctx.beginPath();
        const lineWidth = 3;
        
        // Calculate points for a thicker line
        const startX = x;
        const startY = y + patternSize;
        const endX = x + patternSize;
        const endY = y;
        
        // Draw a thick line by creating a polygon
        const angle = Math.atan2(endY - startY, endX - startX);
        const perpAngle = angle + Math.PI/2;
        
        const offsetX = Math.cos(perpAngle) * lineWidth/2;
        const offsetY = Math.sin(perpAngle) * lineWidth/2;
        
        ctx.beginPath();
        ctx.moveTo(startX + offsetX, startY + offsetY);
        ctx.lineTo(endX + offsetX, endY + offsetY);
        ctx.lineTo(endX - offsetX, endY - offsetY);
        ctx.lineTo(startX - offsetX, startY - offsetY);
        ctx.closePath();
        
        ctx.clip();
        
        // Apply texture to the diagonal
        applyTexture(ctx, textures.moulding, 
                    Math.min(startX, endX) - lineWidth, 
                    Math.min(startY, endY) - lineWidth,
                    Math.abs(endX - startX) + lineWidth * 2,
                    Math.abs(endY - startY) + lineWidth * 2, {
          scale: 0.1
        });
        
        ctx.restore();
        
        // Downward diagonal
        ctx.save();
        
        // Create diagonal path
        const startX2 = x + patternSize;
        const startY2 = y;
        const endX2 = x + patternSize * 2;
        const endY2 = y + patternSize;
        
        // Draw a thick line
        const angle2 = Math.atan2(endY2 - startY2, endX2 - startX2);
        const perpAngle2 = angle2 + Math.PI/2;
        
        const offsetX2 = Math.cos(perpAngle2) * lineWidth/2;
        const offsetY2 = Math.sin(perpAngle2) * lineWidth/2;
        
        ctx.beginPath();
        ctx.moveTo(startX2 + offsetX2, startY2 + offsetY2);
        ctx.lineTo(endX2 + offsetX2, endY2 + offsetY2);
        ctx.lineTo(endX2 - offsetX2, endY2 - offsetY2);
        ctx.lineTo(startX2 - offsetX2, startY2 - offsetY2);
        ctx.closePath();
        
        ctx.clip();
        
        // Apply texture to the diagonal
        applyTexture(ctx, textures.moulding, 
                    Math.min(startX2, endX2) - lineWidth, 
                    Math.min(startY2, endY2) - lineWidth,
                    Math.abs(endX2 - startX2) + lineWidth * 2,
                    Math.abs(endY2 - startY2) + lineWidth * 2, {
          scale: 0.1
        });
        
        ctx.restore();
      }
    }
  } else {
    // Fallback
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    
    // Draw outer frame
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    
    // Draw herringbone pattern
    for (let y = margin * 1.5; y < height - margin * 1.5; y += patternSize * 2) {
      for (let x = margin * 1.5; x < width - margin * 1.5; x += patternSize * 2) {
        // Upward diagonal
        ctx.beginPath();
        ctx.moveTo(x, y + patternSize);
        ctx.lineTo(x + patternSize, y);
        ctx.stroke();
        
        // Downward diagonal
        ctx.beginPath();
        ctx.moveTo(x + patternSize, y);
        ctx.lineTo(x + patternSize * 2, y + patternSize);
        ctx.stroke();
      }
    }
  }
}

// Functions for other moulding types would be implemented similarly
// I'm showing just a few patterns to demonstrate the approach while keeping the code manageable

function drawPaneledMoulding(ctx, width, height, config, textures) {
  // Implementation similar to other patterns, using textures and lighting
  const margin = width * 0.1;
  const cols = 3;
  const rows = 2;
  
  if (!textures.moulding) {
    // Fallback to original implementation
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    
    // Draw outer frame
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
    
    // Calculate panel dimensions
    const availWidth = width - margin * 2;
    const availHeight = height - margin * 2;
    const panelWidth = availWidth / cols;
    const panelHeight = availHeight / rows;
    
    // Draw vertical dividers
    for (let i = 1; i < cols; i++) {
      ctx.beginPath();
      ctx.moveTo(margin + i * panelWidth, margin);
      ctx.lineTo(margin + i * panelWidth, height - margin);
      ctx.stroke();
    }
    
    // Draw horizontal dividers
    for (let j = 1; j < rows; j++) {
      ctx.beginPath();
      ctx.moveTo(margin, margin + j * panelHeight);
      ctx.lineTo(width - margin, margin + j * panelHeight);
      ctx.stroke();
    }
    
    // Draw inner frames in each panel
    const innerMargin = Math.min(panelWidth, panelHeight) * 0.1;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const x = margin + i * panelWidth + innerMargin;
        const y = margin + j * panelHeight + innerMargin;
        const w = panelWidth - innerMargin * 2;
        const h = panelHeight - innerMargin * 2;
        
        ctx.strokeRect(x, y, w, h);
      }
    }
    return;
  }
  
  // With textures - draw outer frame
  drawTexturedFrame(ctx, margin, margin, width - margin * 2, height - margin * 2, textures.moulding);
  
  // Calculate panel dimensions
  const availWidth = width - margin * 2;
  const availHeight = height - margin * 2;
  const panelWidth = availWidth / cols;
  const panelHeight = availHeight / rows;
  
  // Draw grid with textures
  for (let i = 0; i <= cols; i++) {
    const x = margin + i * panelWidth;
    drawTexturedLine(ctx, x, margin, x, height - margin, textures.moulding);
  }
  
  for (let j = 0; j <= rows; j++) {
    const y = margin + j * panelHeight;
    drawTexturedLine(ctx, margin, y, width - margin, y, textures.moulding);
  }
  
  // Draw inner panels
  const innerMargin = Math.min(panelWidth, panelHeight) * 0.1;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = margin + i * panelWidth + innerMargin;
      const y = margin + j * panelHeight + innerMargin;
      const w = panelWidth - innerMargin * 2;
      const h = panelHeight - innerMargin * 2;
      
      drawTexturedFrame(ctx, x, y, w, h, textures.moulding);
    }
  }
}

function drawWainscotingMoulding(ctx, width, height, config, textures) {
  // Implementation similar to other patterns, using textures and lighting
  const margin = width * 0.1;
  
  if (!textures.moulding) {
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    return drawWainscotingOriginal(ctx, width, height, config);
  }
  
  // Chair rail
  const railHeight = height * 0.4;
  drawTexturedLine(ctx, 0, railHeight, width, railHeight, textures.moulding, 8);
  
  // Baseboard
  drawTexturedLine(ctx, 0, height - margin * 0.5, width, height - margin * 0.5, textures.moulding, 8);
  
  // Draw panels below the rail
  const panelCount = 4;
  const panelWidth = (width - margin) / panelCount;
  const panelHeight = height - railHeight - margin;
  
  for (let i = 0; i < panelCount; i++) {
    const x = margin / 2 + i * panelWidth;
    const y = railHeight + margin / 2;
    
    // Outer rectangle
    drawTexturedFrame(ctx, x, y, panelWidth - margin / 2, panelHeight - margin, textures.moulding);
    
    // Inner rectangle
    const innerMargin = panelWidth * 0.1;
    drawTexturedFrame(
      ctx, 
      x + innerMargin, 
      y + innerMargin, 
      panelWidth - margin / 2 - innerMargin * 2, 
      panelHeight - margin - innerMargin * 2, 
      textures.moulding
    );
  }
}

function drawShiplapMoulding(ctx, width, height, config, textures) {
  // Implementation similar to other patterns, using textures and lighting
  if (!textures.moulding) {
    return drawShiplapOriginal(ctx, width, height, config);
  }
  
  const boardCount = 8;
  const boardHeight = height / boardCount;
  
  for (let i = 0; i < boardCount; i++) {
    const y = i * boardHeight;
    
    // Create a slightly different color for alternating boards
    const tint = i % 2 === 0 ? '#f5f5f5' : '#e0e0e0';
    
    // Draw board with texture
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y, width, boardHeight - 1);
    ctx.clip();
    
    // Apply wood texture
    applyTexture(ctx, textures.moulding, 0, y, width, boardHeight - 1, {
      scale: 0.2,
      tint: tint
    });
    
    // Add lighting
    applyLighting(ctx, 0, y, width, boardHeight - 1, {
      intensity: 0.3,
      lightDirection: i % 2 === 0 ? 'top' : 'bottom'
    });
    
    ctx.restore();
    
    // Draw shadow line at the bottom of each board
    ctx.beginPath();
    ctx.moveTo(0, y + boardHeight - 1);
    ctx.lineTo(width, y + boardHeight - 1);
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetY = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

// Utility for drawing textured frames
function drawTexturedFrame(ctx, x, y, width, height, texture, thickness = 5) {
  // Save context
  ctx.save();
  
  // Create frame path (outer rectangle minus inner rectangle)
  ctx.beginPath();
  ctx.rect(x, y, width, height); // Outer rectangle
  ctx.rect(x + thickness, y + thickness, width - thickness * 2, height - thickness * 2); // Inner cutout
  ctx.clip('evenodd'); // Use evenodd to create the "hole"
  
  // Apply texture
  applyTexture(ctx, texture, x, y, width, height, {
    scale: 0.15
  });
  
  // Add lighting effect
  applyLighting(ctx, x, y, width, height, {
    intensity: 0.4
  });
  
  // Add 3D effect
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Restore context
  ctx.restore();
  
  // Add highlight
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// Utility for drawing textured lines
function drawTexturedLine(ctx, x1, y1, x2, y2, texture, thickness = 5) {
  // Save context
  ctx.save();
  
  // Calculate angle and length of line
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  
  // Calculate corners of the line rectangle
  const halfThickness = thickness / 2;
  const perpAngle = angle + Math.PI/2;
  const dx = Math.cos(perpAngle) * halfThickness;
  const dy = Math.sin(perpAngle) * halfThickness;
  
  // Create clipping path for the line
  ctx.beginPath();
  ctx.moveTo(x1 + dx, y1 + dy);
  ctx.lineTo(x2 + dx, y2 + dy);
  ctx.lineTo(x2 - dx, y2 - dy);
  ctx.lineTo(x1 - dx, y1 - dy);
  ctx.closePath();
  ctx.clip();
  
  // Calculate bounding box of the line
  const minX = Math.min(x1 - halfThickness, x2 - halfThickness);
  const minY = Math.min(y1 - halfThickness, y2 - halfThickness);
  const width = Math.abs(x2 - x1) + thickness;
  const height = Math.abs(y2 - y1) + thickness;
  
  // Apply texture
  applyTexture(ctx, texture, minX, minY, width, height, {
    scale: 0.1
  });
  
  // Add lighting effect
  applyLighting(ctx, minX, minY, width, height, {
    intensity: 0.4
  });
  
  // Restore context
  ctx.restore();
  
  // Add 3D effect
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = thickness;
  ctx.stroke();
  ctx.restore();
}

// Fallback functions (original implementations)
function drawWainscotingOriginal(ctx, width, height, config) {
  const margin = width * 0.1;
  
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  
  // Draw chair rail (horizontal divider at 40% height)
  const railHeight = height * 0.4;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, railHeight);
  ctx.lineTo(width, railHeight);
  ctx.stroke();
  ctx.lineWidth = 2;
  
  // Draw baseboards (bottom edge)
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, height - margin * 0.5);
  ctx.lineTo(width, height - margin * 0.5);
  ctx.stroke();
  ctx.lineWidth = 2;
  
  // Draw panels below the rail
  const panelCount = 4;
  const panelWidth = (width - margin) / panelCount;
  const panelHeight = height - railHeight - margin;
  
  for (let i = 0; i < panelCount; i++) {
    const x = margin / 2 + i * panelWidth;
    const y = railHeight + margin / 2;
    
    // Outer rectangle
    ctx.strokeRect(x, y, panelWidth - margin / 2, panelHeight - margin);
    
    // Inner rectangle
    const innerMargin = panelWidth * 0.1;
    ctx.strokeRect(x + innerMargin, y + innerMargin, 
                  panelWidth - margin / 2 - innerMargin * 2, 
                  panelHeight - margin - innerMargin * 2);
  }
}

function drawShiplapOriginal(ctx, width, height, config) {
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1;
  
  // Draw horizontal boards
  const boardCount = 8;
  const boardHeight = height / boardCount;
  
  for (let i = 0; i < boardCount; i++) {
    const y = i * boardHeight;
    
    // Draw board
    ctx.fillStyle = i % 2 === 0 ? '#e6e6e6' : '#f2f2f2';
    ctx.fillRect(0, y, width, boardHeight - 1);
    
    // Draw shadow line to give depth
    ctx.beginPath();
    ctx.moveTo(0, y + boardHeight - 1);
    ctx.lineTo(width, y + boardHeight - 1);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.stroke();
    ctx.strokeStyle = '#333333';
  }
} 