'use client';

import { useEffect, useRef } from 'react';
import { WallConfig } from './AccentWallDesigner';

interface RoomVisualizerProps {
  config: WallConfig;
}

export default function RoomVisualizer({ config }: RoomVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw room in 3D perspective
    drawRoom(ctx, canvas.width, canvas.height, config);
    
  }, [config]);
  
  return (
    <div className="bg-gray-100 rounded-lg shadow-md p-4 h-[500px]">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Room Preview</h3>
      </div>
      <div className="relative h-[calc(100%-2rem)]">
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

// Draw a 3D room with the accent wall
function drawRoom(ctx: CanvasRenderingContext2D, width: number, height: number, config: WallConfig) {
  // Set background (floor)
  ctx.fillStyle = '#f5f5f5';
  ctx.fillRect(0, 0, width, height);
  
  // Draw ceiling
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width, 0);
  ctx.lineTo(width, height * 0.4);
  ctx.lineTo(0, height * 0.4);
  ctx.closePath();
  ctx.fill();
  
  // Draw left wall
  ctx.fillStyle = '#e6e6e6';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height);
  ctx.lineTo(width * 0.3, height * 0.7);
  ctx.lineTo(width * 0.3, height * 0.4);
  ctx.closePath();
  ctx.fill();
  
  // Draw floor
  ctx.fillStyle = '#d2c0a5'; // Wood floor color
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(width, height);
  ctx.lineTo(width, height * 0.7);
  ctx.lineTo(width * 0.3, height * 0.7);
  ctx.closePath();
  ctx.fill();
  
  // Draw accent wall
  ctx.fillStyle = config.color;
  ctx.beginPath();
  ctx.moveTo(width * 0.3, height * 0.4);
  ctx.lineTo(width, height * 0.4);
  ctx.lineTo(width, height * 0.7);
  ctx.lineTo(width * 0.3, height * 0.7);
  ctx.closePath();
  ctx.fill();
  
  // Draw moulding on accent wall in perspective
  drawMouldingInPerspective(ctx, width, height, config);
  
  // Add furniture for context
  drawFurniture(ctx, width, height);
  
  // Add window for light
  drawWindow(ctx, width, height);
  
  // Add shadows for realism
  drawShadows(ctx, width, height);
}

// Draw the moulding pattern on the wall in perspective
function drawMouldingInPerspective(ctx: CanvasRenderingContext2D, width: number, height: number, config: WallConfig) {
  const mouldingType = config.mouldingType;
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  
  // Wall coordinates in perspective
  const wallLeft = width * 0.3;
  const wallRight = width;
  const wallTop = height * 0.4;
  const wallBottom = height * 0.7;
  
  // Draw different moulding types
  switch(mouldingType) {
    case 'classic':
      // Two frames
      drawPerspectiveRect(ctx, wallLeft + (wallRight - wallLeft) * 0.1, 
                          wallTop + (wallBottom - wallTop) * 0.1,
                          (wallRight - wallLeft) * 0.8, 
                          (wallBottom - wallTop) * 0.8);
      drawPerspectiveRect(ctx, wallLeft + (wallRight - wallLeft) * 0.2, 
                          wallTop + (wallBottom - wallTop) * 0.2,
                          (wallRight - wallLeft) * 0.6, 
                          (wallBottom - wallTop) * 0.6);
      break;
    
    case 'modern':
      // Horizontal lines
      for (let i = 1; i < 4; i++) {
        const y = wallTop + (wallBottom - wallTop) * (i / 4);
        drawPerspectiveLine(ctx, wallLeft, y, wallRight, y);
      }
      // Vertical line
      const midX = wallLeft + (wallRight - wallLeft) / 2;
      drawPerspectiveLine(ctx, midX, wallTop, midX, wallBottom);
      break;
    
    case 'geometric':
      // Diamond pattern
      const diamondSize = (wallBottom - wallTop) * 0.2;
      for (let x = wallLeft + diamondSize; x < wallRight; x += diamondSize * 2) {
        for (let y = wallTop + diamondSize; y < wallBottom; y += diamondSize * 2) {
          drawPerspectiveDiamond(ctx, x, y, diamondSize);
        }
      }
      break;
    
    case 'minimal':
      // Single frame
      drawPerspectiveRect(ctx, wallLeft + (wallRight - wallLeft) * 0.15, 
                        wallTop + (wallBottom - wallTop) * 0.15,
                        (wallRight - wallLeft) * 0.7, 
                        (wallBottom - wallTop) * 0.7);
      break;
      
    case 'herringbone':
      // Herringbone pattern
      drawHerringboneInPerspective(ctx, wallLeft, wallTop, wallRight - wallLeft, wallBottom - wallTop);
      break;
      
    case 'paneled':
      // Paneled grid
      drawPanelGridInPerspective(ctx, wallLeft, wallTop, wallRight - wallLeft, wallBottom - wallTop);
      break;
      
    case 'wainscoting':
      // Wainscoting
      drawWainscotingInPerspective(ctx, wallLeft, wallTop, wallRight - wallLeft, wallBottom - wallTop);
      break;
      
    case 'shiplap':
      // Shiplap
      drawShiplapInPerspective(ctx, wallLeft, wallTop, wallRight - wallLeft, wallBottom - wallTop);
      break;
      
    default:
      // Default to minimal frame
      drawPerspectiveRect(ctx, wallLeft + (wallRight - wallLeft) * 0.15, 
                        wallTop + (wallBottom - wallTop) * 0.15,
                        (wallRight - wallLeft) * 0.7, 
                        (wallBottom - wallTop) * 0.7);
  }
}

// Helper functions for drawing in perspective
function drawPerspectiveRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.stroke();
}

function drawPerspectiveLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawPerspectiveDiamond(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, size: number) {
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - size);
  ctx.lineTo(centerX + size, centerY);
  ctx.lineTo(centerX, centerY + size);
  ctx.lineTo(centerX - size, centerY);
  ctx.closePath();
  ctx.stroke();
}

function drawHerringboneInPerspective(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const patternWidth = width / 8;
  const patternHeight = height / 5;
  
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 5; j++) {
      const startX = x + i * patternWidth;
      const startY = y + j * patternHeight;
      
      // Draw diagonal lines in alternating directions
      if ((i + j) % 2 === 0) {
        // Up-right diagonal
        ctx.beginPath();
        ctx.moveTo(startX, startY + patternHeight);
        ctx.lineTo(startX + patternWidth, startY);
        ctx.stroke();
      } else {
        // Down-right diagonal
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + patternWidth, startY + patternHeight);
        ctx.stroke();
      }
    }
  }
}

function drawPanelGridInPerspective(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const cols = 3;
  const rows = 2;
  const cellWidth = width / cols;
  const cellHeight = height / rows;
  
  // Draw grid
  for (let i = 0; i <= cols; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * cellWidth, y);
    ctx.lineTo(x + i * cellWidth, y + height);
    ctx.stroke();
  }
  
  for (let j = 0; j <= rows; j++) {
    ctx.beginPath();
    ctx.moveTo(x, y + j * cellHeight);
    ctx.lineTo(x + width, y + j * cellHeight);
    ctx.stroke();
  }
  
  // Draw inner frames in each cell
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cellX = x + i * cellWidth;
      const cellY = y + j * cellHeight;
      const margin = Math.min(cellWidth, cellHeight) * 0.1;
      
      ctx.beginPath();
      ctx.rect(cellX + margin, cellY + margin, cellWidth - margin * 2, cellHeight - margin * 2);
      ctx.stroke();
    }
  }
}

function drawWainscotingInPerspective(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  // Draw chair rail (horizontal divider)
  const railHeight = y + height * 0.4;
  ctx.beginPath();
  ctx.moveTo(x, railHeight);
  ctx.lineTo(x + width, railHeight);
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.lineWidth = 2;
  
  // Draw panels below the rail
  const panelWidth = width / 4;
  
  for (let i = 0; i < 4; i++) {
    const panelX = x + i * panelWidth;
    const panelY = railHeight;
    const margin = panelWidth * 0.1;
    
    // Draw panel
    ctx.beginPath();
    ctx.rect(panelX + margin, panelY, panelWidth - margin * 2, height * 0.6 - margin);
    ctx.stroke();
    
    // Draw inner detail
    ctx.beginPath();
    ctx.rect(panelX + margin * 2, panelY + margin, panelWidth - margin * 4, height * 0.6 - margin * 3);
    ctx.stroke();
  }
}

function drawShiplapInPerspective(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  const boardHeight = height / 6;
  
  for (let i = 0; i < 6; i++) {
    const boardY = y + i * boardHeight;
    
    // Draw horizontal board
    ctx.beginPath();
    ctx.rect(x, boardY, width, boardHeight - 1);
    ctx.stroke();
    
    // Draw shadow line at bottom of each board
    ctx.beginPath();
    ctx.moveTo(x, boardY + boardHeight - 1);
    ctx.lineTo(x + width, boardY + boardHeight - 1);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#333333';
  }
}

function drawFurniture(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Draw a sofa
  ctx.fillStyle = '#6b8e9e'; // Sofa color
  const sofaWidth = width * 0.4;
  const sofaHeight = height * 0.15;
  const sofaX = width * 0.5;
  const sofaY = height * 0.75;
  
  // Sofa base
  ctx.beginPath();
  ctx.rect(sofaX, sofaY, sofaWidth, sofaHeight);
  ctx.fill();
  
  // Sofa back
  ctx.beginPath();
  ctx.rect(sofaX, sofaY - sofaHeight * 0.6, sofaWidth, sofaHeight * 0.6);
  ctx.fillStyle = '#5d7d8c';
  ctx.fill();
  
  // Sofa armrests
  ctx.beginPath();
  ctx.rect(sofaX - sofaWidth * 0.05, sofaY, sofaWidth * 0.05, sofaHeight);
  ctx.rect(sofaX + sofaWidth, sofaY, sofaWidth * 0.05, sofaHeight);
  ctx.fillStyle = '#5d7d8c';
  ctx.fill();
  
  // Coffee table
  ctx.fillStyle = '#8a6343'; // Table color
  ctx.beginPath();
  ctx.rect(sofaX + sofaWidth * 0.1, sofaY + sofaHeight * 1.2, sofaWidth * 0.8, sofaHeight * 0.4);
  ctx.fill();
  
  // Table legs
  ctx.fillStyle = '#6b4f35';
  ctx.beginPath();
  const legWidth = sofaWidth * 0.03;
  ctx.rect(sofaX + sofaWidth * 0.1, sofaY + sofaHeight * 1.6, legWidth, sofaHeight * 0.2);
  ctx.rect(sofaX + sofaWidth * 0.9 - legWidth, sofaY + sofaHeight * 1.6, legWidth, sofaHeight * 0.2);
  ctx.fill();
  
  // Add a plant
  const plantX = width * 0.85;
  const plantY = height * 0.65;
  const plantSize = height * 0.15;
  
  // Pot
  ctx.fillStyle = '#bd6b57';
  ctx.beginPath();
  ctx.moveTo(plantX - plantSize * 0.3, plantY);
  ctx.lineTo(plantX + plantSize * 0.3, plantY);
  ctx.lineTo(plantX + plantSize * 0.2, plantY + plantSize * 0.4);
  ctx.lineTo(plantX - plantSize * 0.2, plantY + plantSize * 0.4);
  ctx.closePath();
  ctx.fill();
  
  // Plant
  ctx.fillStyle = '#5a9e54';
  ctx.beginPath();
  ctx.arc(plantX, plantY, plantSize * 0.4, 0, Math.PI, true);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(plantX - plantSize * 0.2, plantY - plantSize * 0.1, plantSize * 0.25, 0, Math.PI, true);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(plantX + plantSize * 0.2, plantY - plantSize * 0.15, plantSize * 0.3, 0, Math.PI, true);
  ctx.fill();
}

function drawWindow(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Draw window on left wall
  const windowWidth = width * 0.15;
  const windowHeight = height * 0.2;
  const windowX = width * 0.05;
  const windowY = height * 0.45;
  
  // Window frame
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.rect(windowX, windowY, windowWidth, windowHeight);
  ctx.stroke();
  
  // Window panes
  ctx.beginPath();
  ctx.moveTo(windowX + windowWidth / 2, windowY);
  ctx.lineTo(windowX + windowWidth / 2, windowY + windowHeight);
  ctx.moveTo(windowX, windowY + windowHeight / 2);
  ctx.lineTo(windowX + windowWidth, windowY + windowHeight / 2);
  ctx.stroke();
  
  // Window light effect
  ctx.fillStyle = 'rgba(255, 255, 200, 0.2)';
  ctx.beginPath();
  ctx.rect(windowX, windowY, windowWidth, windowHeight);
  ctx.fill();
  
  // Window light on floor
  ctx.fillStyle = 'rgba(255, 255, 200, 0.1)';
  ctx.beginPath();
  ctx.moveTo(windowX, windowY + windowHeight);
  ctx.lineTo(windowX + windowWidth, windowY + windowHeight);
  ctx.lineTo(windowX + windowWidth * 1.5, height);
  ctx.lineTo(windowX - windowWidth * 0.5, height);
  ctx.closePath();
  ctx.fill();
}

function drawShadows(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Add subtle shadows for depth
  
  // Corner shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.beginPath();
  ctx.moveTo(width * 0.3, height * 0.4);
  ctx.lineTo(width * 0.3, height * 0.7);
  ctx.lineTo(width * 0.3 + 10, height * 0.7);
  ctx.lineTo(width * 0.3 + 10, height * 0.4);
  ctx.closePath();
  ctx.fill();
  
  // Floor shadow from sofa
  const sofaWidth = width * 0.4;
  const sofaHeight = height * 0.15;
  const sofaX = width * 0.5;
  const sofaY = height * 0.75;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.beginPath();
  ctx.ellipse(sofaX + sofaWidth / 2, sofaY + sofaHeight, sofaWidth / 1.5, sofaHeight / 3, 0, 0, Math.PI * 2);
  ctx.fill();
} 