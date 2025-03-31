'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function InstructionsGenerator({ config, onInstructionsGenerated }) {
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(true); // Toggle to control AI vs. fallback generation
  const timerRef = useRef(null);
  
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set loading state immediately for feedback
    setLoading(true);
    
    // Notify parent component about loading state
    if (onInstructionsGenerated) {
      onInstructionsGenerated('', true); // Pass empty instructions but true for loading
    }
    
    // Set a new timer to wait 6 seconds before generating instructions
    timerRef.current = setTimeout(() => {
      generateInstructions();
    }, 6000); // 6 seconds delay
    
    // Cleanup function to clear the timer if the component unmounts
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [config]);
  
  // Generate instructions based on the design
  const generateInstructions = async () => {
    try {
      if (useAI) {
        try {
          // Calculate moulding pieces and materials for the API call
          const pieces = calculateMouldingPieces(
            config.width, 
            config.height, 
            config.mouldingType, 
            config.patternRepeats
          );
          
          const materials = calculateTotalMaterials(pieces);
          
          // Call our API route that uses Vertex AI
          const response = await fetch('/api/generate-instructions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mouldingType: config.mouldingType,
              dimensions: { width: config.width, height: config.height },
              patternRepeats: config.patternRepeats,
              materials: materials,
              pieces: pieces
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to generate AI instructions');
          }
          
          const data = await response.json();
          setInstructions(data.instructions);
          
          // Notify parent component about the new instructions
          if (onInstructionsGenerated) {
            onInstructionsGenerated(data.instructions, false);
          }
        } catch (error) {
          console.error('Error generating AI instructions:', error);
          // If AI generation fails, fall back to the template-based generation
          setUseAI(false);
          generateFallbackInstructions();
        } finally {
          setLoading(false);
        }
      } else {
        generateFallbackInstructions();
      }
    } catch (error) {
      console.error('Error in generateInstructions:', error);
      setLoading(false);
      
      // Notify parent that loading is complete even if there was an error
      if (onInstructionsGenerated) {
        onInstructionsGenerated(instructions, false);
      }
    }
  };
  
  // Fallback method if AI generation fails
  const generateFallbackInstructions = async () => {
    try {
      // Generate basic instructions based on the design type
      const baseInstructions = {
        classic: "Start by measuring and marking your wall according to the pattern repeats. For each frame, cut the horizontal pieces to the specified length, followed by the vertical pieces. Use a miter saw set to 45° to cut the corners. Attach the pieces to the wall using construction adhesive and finish nails. Use a level to ensure each frame is straight.",
        grid: "Begin by marking a grid on your wall matching the pattern repeat dimensions. Cut all horizontal pieces to the same length, and all vertical pieces to the same length. Use a square to ensure 90° corners where pieces intersect. Attach to the wall using construction adhesive and finish nails.",
        geometric: "For this diamond pattern, start by marking the center points for each diamond. Cut all diamond sides to the specified length with 45° angles at both ends. Attach the first diamond using construction adhesive, then add connecting pieces between diamonds. Use a laser level to maintain proper alignment.",
        diamond: "Measure and mark the center point of each diamond on your wall. Cut four equal-length pieces for each diamond with 45° angles at both ends. Start attaching from the center and work outward, using construction adhesive and finish nails.",
        chevron: "Mark a centerline and measure out your chevron pattern. Cut each piece to length with matching angles (typically 45°) at the ends where they will meet. Attach using construction adhesive starting from the center working outward.",
        rectangular: "Work from the outside in for this layered pattern. Measure and cut the outer frame first, followed by the inner frames. Use a miter saw for clean 45° corners. Attach the largest frame first, then add each smaller frame within it, using spacers to maintain even spacing.",
        herringbone: "Start by finding the center of your wall and drawing a vertical line. Create angled lines at 45° from this center line. Cut all pieces to the same length with 45° angles at both ends. Attach in a V pattern, working outward from the center.",
        coffered: "Begin by creating a grid layout with horizontal and vertical pieces. Then add additional moulding layers to create depth. Cut pieces at 90° for clean joins, and use a nail gun to attach each layer securely.",
        wainscoting: "Divide your wall into equal panels. Install the base rail first, then vertical stiles at equal spacing, followed by the top rail. Finish with panel moulding to create the recessed panel look.",
        shiplap: "Install horizontally starting from the bottom. Use spacers to maintain consistent 1/8\" gaps between boards. Ensure each board is level before nailing. Stagger joints for a more natural look.",
        diagonalCross: "Start by marking the center of your wall. Install the diagonal pieces first, creating an X pattern. Then add the horizontal and vertical bars. Ensure all intersections are secure with additional fasteners.",
        verticalSlat: "Begin at one end of the wall and install vertical slats at even intervals. Use spacers to maintain consistent gaps. Ensure each slat is plumb before securing.",
        geometricSquares: "Mark a grid on your wall. Cut all pieces to create square frames, using a miter saw for clean 45° corners. Install from the center outward, maintaining equal spacing between frames."
      };
      
      // Ensure there's a fallback for all moulding types
      let fallbackInstructions = baseInstructions[config.mouldingType] || 
        "Mark your wall according to your design plan. Cut moulding pieces to the specified lengths and attach to the wall using construction adhesive and finish nails.";
        
      // Format the fallback instructions using markdown for better structure
      fallbackInstructions = `## Installation Instructions for ${config.mouldingType.charAt(0).toUpperCase() + config.mouldingType.slice(1)} Pattern\n\n${fallbackInstructions}\n\n`;
      
      // Add materials section
      fallbackInstructions += "## Materials Needed\n\n";
      fallbackInstructions += "* Moulding pieces (see measurements below)\n";
      fallbackInstructions += "* Construction adhesive\n";
      fallbackInstructions += "* Finish nails\n";
      fallbackInstructions += "* Level\n";
      fallbackInstructions += "* Measuring tape\n";
      fallbackInstructions += "* Miter saw\n\n";
      
      // Add a tools section
      fallbackInstructions += "## Tools Required\n\n";
      fallbackInstructions += "* Miter saw\n";
      fallbackInstructions += "* Nail gun or hammer\n";
      fallbackInstructions += "* Level\n";
      fallbackInstructions += "* Measuring tape\n";
      fallbackInstructions += "* Pencil\n";
      fallbackInstructions += "* Stud finder\n\n";
      
      // Add a safety section
      fallbackInstructions += "## Safety Considerations\n\n";
      fallbackInstructions += "* Always wear safety glasses when cutting moulding\n";
      fallbackInstructions += "* Use proper ventilation when applying adhesives\n";
      fallbackInstructions += "* Follow manufacturer instructions for all tools\n\n";
      
      // Add finishing touches
      fallbackInstructions += "## Finishing\n\n";
      fallbackInstructions += "After installation, fill any nail holes with wood filler, sand smooth, and paint the moulding in your chosen color. For best results, use semi-gloss or satin finish paint.";
      
      setInstructions(fallbackInstructions);
      
      // Notify parent component about the new instructions
      if (onInstructionsGenerated) {
        onInstructionsGenerated(fallbackInstructions, false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error generating fallback instructions:', error);
      setLoading(false);
      
      // Notify parent that loading is complete even if there was an error
      if (onInstructionsGenerated) {
        onInstructionsGenerated("Unable to generate instructions. Please try again.", false);
      }
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2 items-center">
          {loading && (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
              <span className="text-sm text-gray-600">
                Generating {useAI ? 'customized' : 'standard'} plans...
              </span>
            </>
          )}
          {!loading && instructions && (
            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Plans Ready
            </div>
          )}
        </div>
        <button
          onClick={() => setUseAI(!useAI)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {useAI ? 'Use standard template' : 'Use AI generation'}
        </button>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200 prose prose-sm max-w-none">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="w-10 h-10 border-4 rounded-full border-blue-600 border-t-transparent animate-spin"></div>
            <p className="text-gray-500">Generating {useAI ? 'customized' : 'standard'} installation plans...</p>
            <p className="text-xs text-gray-400">This may take a moment</p>
          </div>
        ) : instructions ? (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{instructions}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-gray-500 italic">Installation plans will appear here.</p>
        )}
      </div>
    </div>
  );
}

// Helper functions for calculating pieces and materials
const calculateMouldingPieces = (width, height, mouldingType, patternRepeats) => {
  // Simplified placeholder for the actual calculation logic
  return [
    {
      type: 'Horizontal',
      length: (width * 12 / patternRepeats.horizontal).toFixed(1),
      quantity: 2 * patternRepeats.horizontal * patternRepeats.vertical,
      pattern: 'Frame'
    },
    {
      type: 'Vertical',
      length: (height * 12 / patternRepeats.vertical).toFixed(1),
      quantity: 2 * patternRepeats.horizontal * patternRepeats.vertical,
      pattern: 'Frame'
    }
  ];
};

const calculateTotalMaterials = (pieces) => {
  // Group by type
  const byType = pieces.reduce((acc, piece) => {
    const { type, length, quantity } = piece;
    if (!acc[type]) acc[type] = 0;
    acc[type] += parseFloat(length) * quantity;
    return acc;
  }, {});
  
  // Convert to array with 10% waste
  return Object.entries(byType).map(([type, totalLength]) => ({
    type,
    totalLength: totalLength.toFixed(1),
    withWaste: (totalLength * 1.1).toFixed(1)
  }));
}; 