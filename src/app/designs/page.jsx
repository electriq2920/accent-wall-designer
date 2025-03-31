'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const designExamples = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional double-framed design that creates an elegant focal point for your room. This timeless style works well in both traditional and transitional interiors.',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean horizontal lines with a vertical center accent, perfect for contemporary spaces. This design creates visual interest without overwhelming the wall.',
  },
  {
    id: 'geometric',
    name: 'Geometric',
    description: 'Diamond pattern for visual interest and a unique focal point. This eye-catching design works well in eclectic and modern spaces.',
  },
  {
    id: 'diamond',
    name: 'Diamond',
    description: 'Diamond shaped accent with clean edges. Creates a sophisticated geometric focal point perfect for modern and contemporary spaces.',
  },
  {
    id: 'grid',
    name: 'Grid',
    description: 'Simple grid pattern for a structured look. Adds architectural interest while maintaining a clean and organized appearance.',
  },
  {
    id: 'chevron',
    name: 'Chevron',
    description: 'V-shaped pattern for dynamic style. Creates movement and energy in the space, ideal for accent walls in modern interiors.',
  },
  {
    id: 'rectangular',
    name: 'Rectangular',
    description: 'Nested rectangular frames for depth. Creates a sense of dimension and layers that adds sophistication to any room.',
  },
  {
    id: 'herringbone',
    name: 'Herringbone',
    description: 'Zigzag pattern inspired by classic wood flooring. Creates a dynamic look with visual movement that adds texture to any room.',
  },
  {
    id: 'coffered',
    name: 'Coffered',
    description: 'Grid pattern with raised panels for dimension. Adds architectural detail and depth, reminiscent of coffered ceilings translated to walls.',
  },
  {
    id: 'wainscoting',
    name: 'Wainscoting',
    description: 'Classic lower wall paneling design with a chair rail. Traditional style that protects walls while adding architectural interest.',
  },
  {
    id: 'shiplap',
    name: 'Shiplap',
    description: 'Horizontal wooden boards pattern popularized by farmhouse style. Creates a casual, rustic feel with subtle texture.',
  },
  {
    id: 'diagonalCross',
    name: 'Diagonal Cross',
    description: 'X-pattern with horizontal and vertical bars. Creates a striking geometric pattern that works well in contemporary and transitional spaces.',
  },
  {
    id: 'verticalSlat',
    name: 'Vertical Slat',
    description: 'Vertical boards for height and texture. Creates a sense of height in the room while adding warmth and dimension to your walls.',
  },
  {
    id: 'geometricSquares',
    name: 'Geometric Squares',
    description: 'Grid of framed squares for modern appeal. Creates a clean, organized pattern that adds subtle texture and interest to any room.',
  },
];

function DesignPreview({ design }) {
  const canvasRef = useRef(null);
  
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
    
    // Set background color (light gray)
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw moulding based on type
    drawMoulding(ctx, canvas.width, canvas.height, design.id);
    
  }, [design]);
  
  return (
    <div className="h-[280px] border rounded-md overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
}

function drawMoulding(ctx, width, height, type) {
  switch (type) {
    case 'classic':
      drawClassicMoulding(ctx, width, height);
      break;
    case 'modern':
      drawModernMoulding(ctx, width, height);
      break;
    case 'geometric':
      drawGeometricMoulding(ctx, width, height);
      break;
    case 'minimal':
      drawMinimalMoulding(ctx, width, height);
      break;
    case 'herringbone':
      drawHerringboneMoulding(ctx, width, height);
      break;
    case 'paneled':
      drawPaneledMoulding(ctx, width, height);
      break;
    case 'wainscoting':
      drawWainscotingMoulding(ctx, width, height);
      break;
    case 'shiplap':
      drawShiplapMoulding(ctx, width, height);
      break;
    default:
      drawMinimalMoulding(ctx, width, height);
  }
}

// Moulding drawing functions
function drawClassicMoulding(ctx, width, height) {
  const margin = width * 0.1;
  
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 5;
  
  // Draw outer frame
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
  
  // Draw inner frame
  ctx.strokeRect(margin * 1.5, margin * 1.5, width - margin * 3, height - margin * 3);
}

function drawModernMoulding(ctx, width, height) {
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

function drawGeometricMoulding(ctx, width, height) {
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

function drawMinimalMoulding(ctx, width, height) {
  const margin = width * 0.15;
  
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;
  
  // Draw single outer frame
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);
}

function drawHerringboneMoulding(ctx, width, height) {
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

function drawPaneledMoulding(ctx, width, height) {
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
}

function drawWainscotingMoulding(ctx, width, height) {
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
  }
}

function drawShiplapMoulding(ctx, width, height) {
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

export default function DesignsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Moulding Design Gallery
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Explore different accent wall moulding styles for your next project.
          </p>
          <Link href="/" className="inline-block mt-5 px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Back to Designer
          </Link>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {designExamples.map((design) => (
            <div key={design.id} className="bg-white rounded-lg shadow overflow-hidden">
              <DesignPreview design={design} />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{design.name}</h3>
                <p className="text-gray-600">{design.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 