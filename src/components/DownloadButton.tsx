'use client';

import { useState } from 'react';
import { WallConfig } from './AccentWallDesigner';

interface DownloadButtonProps {
  config: WallConfig;
}

export default function DownloadButton({ config }: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = async () => {
    setIsGenerating(true);
    
    try {
      // In a real application, this would connect to a server to generate PDFs
      // For now, we'll create a text file with the wall specifications
      
      // Create text content
      const content = generatePlanText(config);
      
      // Create downloadable blob
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create download link and trigger click
      const link = document.createElement('a');
      link.href = url;
      link.download = `accent-wall-plan-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('There was an error generating your plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={generatePlan}
        disabled={isGenerating}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Plan...
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Plan
          </>
        )}
      </button>
      <p className="text-center text-xs mt-2 text-gray-500">
        Free download, no sign-up required
      </p>
    </div>
  );
}

function generatePlanText(config: WallConfig): string {
  const { width, height, mouldingType, color } = config;
  
  // Calculate materials needed
  const wallArea = width * height;
  const mouldingLength = calculateMouldingLength(width, height, mouldingType);
  
  return `ACCENT WALL PLAN
Generated on: ${new Date().toLocaleDateString()}

WALL SPECIFICATIONS:
- Dimensions: ${width} ft × ${height} ft
- Total Area: ${wallArea.toFixed(2)} sq ft
- Moulding Type: ${mouldingType.charAt(0).toUpperCase() + mouldingType.slice(1)}
- Wall Color: ${color}

MATERIALS NEEDED:
- Paint: ${Math.ceil(wallArea / 400 * 1.1)} gallon(s)
- Moulding: ${Math.ceil(mouldingLength * 1.1)} linear feet
- Wood Filler: 1 tube
- Sandpaper (220 grit): 1 pack
- Painter's Tape: 1 roll
- Nails: 1 box of finishing nails
- Wood Glue: 1 bottle

TOOLS NEEDED:
- Measuring Tape
- Level
- Miter Saw (for cutting moulding)
- Hammer or Nail Gun
- Paint Roller and Brushes
- Stud Finder
- Pencil

INSTALLATION STEPS:
1. Prepare the wall by cleaning and patching any holes.
2. Paint the wall with your chosen color (${color}).
3. Measure and mark the positions for your moulding.
4. Cut moulding pieces to length, with appropriate angle cuts at corners.
5. Attach moulding to the wall using finishing nails and/or wood glue.
6. Fill nail holes with wood filler and sand smooth.
7. Touch up paint as needed.

For additional help, visit our website at www.accentwallplanner.com
`;
}

function calculateMouldingLength(width: number, height: number, mouldingType: string): number {
  // Calculate total linear feet of moulding needed based on the pattern
  switch (mouldingType) {
    case 'classic':
      // Two rectangular frames
      const outerPerimeter = 2 * (width + height);
      const innerPerimeter = 2 * (width - 1 + height - 1);
      return outerPerimeter + innerPerimeter;
      
    case 'modern':
      // Three horizontal lines plus one vertical
      return (width * 3) + height;
      
    case 'geometric':
      // Rough estimate for diamond pattern
      return width * height * 0.8;
      
    case 'minimal':
      // Single frame
      return 2 * (width + height);
      
    default:
      return 2 * (width + height);
  }
} 