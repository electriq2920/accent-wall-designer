'use client';

import { useEffect, useRef } from 'react';
import { WallConfig } from './AccentWallDesigner';

interface WallVisualizerProps {
  config: WallConfig;
}

export default function WallVisualizer({ config }: WallVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Define moulding patterns
  const mouldingPatterns: Record<string, Function> = {
    classic: drawClassicMoulding,
    modern: drawModernMoulding,
    geometric: drawGeometricMoulding,
    minimal: drawMinimalMoulding,
    herringbone: drawHerringboneMoulding,
    paneled: drawPaneledMoulding,
    wainscoting: drawWainscotingMoulding,
    shiplap: drawShiplapMoulding,
  };
  
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
    
    // Set background color
    ctx.fillStyle = config.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw moulding based on selected type
    const mouldingType = config.mouldingType;
    if (mouldingPatterns[mouldingType]) {
      mouldingPatterns[mouldingType](ctx, canvas.width, canvas.height, config);
    } else {
      mouldingPatterns.classic(ctx, canvas.width, canvas.height, config);
    }
    
  }, [config]);
  
  return (
    <div className="bg-gray-100 rounded-lg shadow-md p-4 h-[500px]">
      <div className="relative h-full">
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

// Moulding drawing functions
function drawClassicMoulding(ctx: CanvasRenderingContext2D, width: number, height: number, config: WallConfig) {
  const margin = width * 0.1;
  
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 5;
  
  // Draw outer frame
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
  
  // Draw inner frame
  ctx.strokeRect(margin * 1.5, margin * 1.5, width - margin * 3, height - margin * 3);
}

function drawModernMoulding(ctx: CanvasRenderingContext2D, width: number, height: number, config: WallConfig) {
  const margin = width * 0.08;
  
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
  
  // Draw vertical line in center
  ctx.beginPath();
  ctx.moveTo(width / 2, margin);
  ctx.lineTo(width / 2, height - margin);
  ctx.stroke();
}

function drawGeometricMoulding(ctx: CanvasRenderingContext2D, width: number, height: number, config: WallConfig) {
  const margin = width * 0.1;
  const size = Math.min(width, height) * 0.15;
  
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 3;
  
  // Draw diamond pattern
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

function drawMinimalMoulding(ctx: CanvasRenderingContext2D, width: number, height: number, config: WallConfig) {
  const margin = width * 0.15;
  
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  
  // Draw single outer frame
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
}

function drawHerringboneMoulding(ctx: CanvasRenderingContext2D, width: number, height: number, config: WallConfig) {
  const margin = width * 0.1;
  const patternSize = width * 0.05;
  
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

function drawPaneledMoulding(ctx: CanvasRenderingContext2D, width: number, height: number, config: WallConfig) {
  const margin = width * 0.1;
  const cols = 3;
  const rows = 2;
  
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
}

function drawWainscotingMoulding(ctx: CanvasRenderingContext2D, width: number, height: number, config: WallConfig) {
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

function drawShiplapMoulding(ctx: CanvasRenderingContext2D, width: number, height: number, config: WallConfig) {
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