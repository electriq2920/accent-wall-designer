'use client';

import React from 'react';

// Function to calculate moulding pieces based on wall dimensions and pattern repeats
const calculateMouldingPieces = (width, height, mouldingType, patternRepeats) => {
  const horizontalRepeats = patternRepeats.horizontal;
  const verticalRepeats = patternRepeats.vertical;
  
  // Convert from feet to inches
  const widthInches = width * 12;
  const heightInches = height * 12;
  
  let pieces = [];
  
  switch(mouldingType) {
    case 'classic':
      // For classic, we need 4 pieces per pattern (rectangular frame)
      for (let h = 0; h < horizontalRepeats; h++) {
        for (let v = 0; v < verticalRepeats; v++) {
          const frameWidth = widthInches / horizontalRepeats * 0.85;
          const frameHeight = heightInches / verticalRepeats * 0.85;
          
          pieces.push({ 
            type: 'Horizontal', 
            length: frameWidth.toFixed(1), 
            quantity: 2,
            pattern: `Frame ${h+1}-${v+1}`
          });
          pieces.push({ 
            type: 'Vertical', 
            length: frameHeight.toFixed(1), 
            quantity: 2,
            pattern: `Frame ${h+1}-${v+1}`
          });
        }
      }
      break;
      
    case 'grid':
      // Horizontal pieces
      const horizontalSpacing = widthInches / horizontalRepeats / 3;
      const totalHorizontalPieces = 4 * horizontalRepeats * verticalRepeats;
      pieces.push({ 
        type: 'Horizontal', 
        length: (widthInches / horizontalRepeats).toFixed(1), 
        quantity: totalHorizontalPieces,
        pattern: 'Grid Lines'
      });
      
      // Vertical pieces
      const verticalSpacing = heightInches / verticalRepeats / 3;
      const totalVerticalPieces = 4 * horizontalRepeats * verticalRepeats;
      pieces.push({ 
        type: 'Vertical', 
        length: (heightInches / verticalRepeats).toFixed(1), 
        quantity: totalVerticalPieces,
        pattern: 'Grid Lines'
      });
      break;
      
    case 'modern':
      // Horizontal lines
      const totalHorizontals = 3 * horizontalRepeats * verticalRepeats;
      pieces.push({ 
        type: 'Horizontal', 
        length: (widthInches / horizontalRepeats * 0.8).toFixed(1), 
        quantity: totalHorizontals,
        pattern: 'Modern Lines'
      });
      
      // Vertical line
      const totalVerticals = horizontalRepeats * verticalRepeats;
      pieces.push({ 
        type: 'Vertical', 
        length: (heightInches / verticalRepeats * 0.8).toFixed(1), 
        quantity: totalVerticals,
        pattern: 'Modern Lines'
      });
      break;
      
    case 'rectangular':
      // Similar to classic but with multiple frames
      const steps = 3;
      for (let s = 0; s < steps; s++) {
        const scaleFactor = 1 - (s * 0.2);
        
        for (let h = 0; h < horizontalRepeats; h++) {
          for (let v = 0; v < verticalRepeats; v++) {
            const frameWidth = widthInches / horizontalRepeats * scaleFactor;
            const frameHeight = heightInches / verticalRepeats * scaleFactor;
            
            pieces.push({ 
              type: 'Horizontal', 
              length: frameWidth.toFixed(1), 
              quantity: 2,
              pattern: `Frame ${h+1}-${v+1} (Layer ${s+1})`
            });
            pieces.push({ 
              type: 'Vertical', 
              length: frameHeight.toFixed(1), 
              quantity: 2,
              pattern: `Frame ${h+1}-${v+1} (Layer ${s+1})`
            });
          }
        }
      }
      break;
      
    case 'geometric':
      // For geometric pattern, calculate diamond shapes
      const diamondSize = Math.min(widthInches / horizontalRepeats, heightInches / verticalRepeats) * 0.5;
      
      // Small squares/diamonds per pattern
      const diamondsPerPattern = 5; // Number of diamond shapes in each pattern repeat
      const totalDiamonds = diamondsPerPattern * horizontalRepeats * verticalRepeats;
      
      // Each diamond needs 4 sides
      pieces.push({ 
        type: 'Diamond Sides', 
        length: diamondSize.toFixed(1), 
        quantity: totalDiamonds * 4,
        pattern: 'Geometric Pattern'
      });
      
      // Connecting pieces between diamonds
      pieces.push({ 
        type: 'Connectors', 
        length: (diamondSize * 0.3).toFixed(1), 
        quantity: totalDiamonds * 2,
        pattern: 'Geometric Pattern'
      });
      break;
      
    case 'diamond':
      // For diamond pattern, calculate actual sizes
      const patternSize = Math.min(widthInches / horizontalRepeats, heightInches / verticalRepeats) * 0.7;
      
      // Each diamond has 4 sides
      pieces.push({ 
        type: 'Diamond Sides', 
        length: patternSize.toFixed(1), 
        quantity: 4 * horizontalRepeats * verticalRepeats,
        pattern: 'Diamond Pattern'
      });
      break;
      
    case 'chevron':
      // For chevron pattern, calculate actual sizes
      const chevronWidth = widthInches / horizontalRepeats;
      const chevronHeight = heightInches / verticalRepeats;
      
      // Each chevron has diagonal pieces
      const chevronPieceLength = Math.sqrt((chevronWidth/2)**2 + (chevronHeight/5)**2);
      
      pieces.push({ 
        type: 'Chevron Pieces', 
        length: chevronPieceLength.toFixed(1), 
        quantity: 20 * horizontalRepeats * verticalRepeats, // 10 "V" shapes per pattern
        pattern: 'Chevron Pattern'
      });
      break;
      
    default:
      // For other patterns, provide a simplified calculation
      pieces.push({ 
        type: 'Various', 
        length: 'Custom sizes', 
        quantity: horizontalRepeats * verticalRepeats,
        pattern: `${mouldingType.charAt(0).toUpperCase() + mouldingType.slice(1)} Pattern`
      });
      break;
  }
  
  return pieces;
};

// Calculate total materials needed
const calculateTotalMaterials = (pieces) => {
  // Group by type
  const byType = pieces.reduce((acc, piece) => {
    const type = piece.type;
    if (!acc[type]) acc[type] = 0;
    
    // Skip non-numeric lengths
    if (piece.length !== 'Custom sizes') {
      const length = parseFloat(piece.length);
      if (!isNaN(length)) {
        acc[type] += length * piece.quantity;
      }
    }
    return acc;
  }, {});
  
  // Convert to array
  return Object.entries(byType).map(([type, totalLength]) => ({
    type,
    totalLength: totalLength.toFixed(1),
    // Add 10% for waste
    withWaste: (totalLength * 1.1).toFixed(1)
  }));
};

export default function DesignMeasurements({ config }) {
  const pieces = calculateMouldingPieces(
    config.width, 
    config.height, 
    config.mouldingType, 
    config.patternRepeats
  );
  
  const materials = calculateTotalMaterials(pieces);
  const hasCustomSizes = pieces.some(piece => piece.length === 'Custom sizes');
  
  // Calculate pattern area for material efficiency
  const wallArea = config.width * config.height;
  const mouldingArea = wallArea * (config.mouldingWidth * 5); // Approximate area covered by moulding
  const coverage = (mouldingArea / wallArea * 100).toFixed(1);
  
  // Group pieces by pattern for better organization
  const piecesByPattern = pieces.reduce((acc, piece) => {
    if (!acc[piece.pattern]) {
      acc[piece.pattern] = [];
    }
    acc[piece.pattern].push(piece);
    return acc;
  }, {});
  
  return (
    <div className="space-y-6">
      {/* Material summary card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">Dimensions</div>
          <div className="text-2xl font-bold">{config.width}' × {config.height}'</div>
          <div className="text-gray-500 text-sm mt-1">{config.width * 12}" × {config.height * 12}"</div>
        </div>
        
        <div className="bg-indigo-50 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-indigo-600 font-medium uppercase tracking-wide mb-1">Pattern</div>
          <div className="text-2xl font-bold capitalize">{config.mouldingType}</div>
          <div className="text-gray-500 text-sm mt-1">{config.patternRepeats.horizontal} × {config.patternRepeats.vertical} repeats</div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Area</div>
          <div className="text-2xl font-bold">{wallArea} ft²</div>
          <div className="text-gray-500 text-sm mt-1">Pattern coverage: ~{coverage}%</div>
        </div>
        
        <div className="bg-amber-50 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-amber-600 font-medium uppercase tracking-wide mb-1">Total Pieces</div>
          <div className="text-2xl font-bold">{pieces.reduce((acc, piece) => acc + piece.quantity, 0)}</div>
          <div className="text-gray-500 text-sm mt-1">{Object.keys(piecesByPattern).length} pattern group(s)</div>
        </div>
      </div>
      
      {/* Cut list with tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Cut List
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {pieces.length} items
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">Pattern</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Length</th>
                <th className="px-4 py-3 text-left font-medium">Qty</th>
                <th className="px-4 py-3 text-left font-medium">Total Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pieces.map((piece, index) => {
                const totalLength = piece.length !== 'Custom sizes' 
                  ? (parseFloat(piece.length) * piece.quantity).toFixed(1) 
                  : '-';
                
                return (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm">{piece.pattern}</td>
                    <td className="px-4 py-3 text-sm font-medium">{piece.type}</td>
                    <td className="px-4 py-3 text-sm">
                      {piece.length !== 'Custom sizes' 
                        ? <span>{piece.length}"</span> 
                        : <span className="italic text-gray-500">Custom</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">{piece.quantity}</td>
                    <td className="px-4 py-3 text-sm">
                      {totalLength !== '-' 
                        ? <span>{totalLength}" <span className="text-gray-400">({(totalLength / 12).toFixed(1)}')</span></span>
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Materials summary */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-base font-semibold text-gray-800 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Total Materials (with 10% waste)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-medium">Material Type</th>
                <th className="px-4 py-3 text-left font-medium">Total Length</th>
                <th className="px-4 py-3 text-left font-medium">With Waste</th>
                <th className="px-4 py-3 text-left font-medium">Feet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {materials.map((material, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">{material.type}</td>
                  <td className="px-4 py-3 text-sm">{material.totalLength}"</td>
                  <td className="px-4 py-3 text-sm">{material.withWaste}"</td>
                  <td className="px-4 py-3 text-sm">{(parseFloat(material.withWaste) / 12).toFixed(1)}'</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {hasCustomSizes && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This pattern includes custom-sized pieces. Exact measurements will depend on your specific installation.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Pattern spacing info */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-base font-semibold text-gray-800 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Spacing Information
          </h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Horizontal Spacing</div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-sm">Section Width:</span>
                <span className="font-medium">{(config.width / config.patternRepeats.horizontal).toFixed(2)}' ({(config.width / config.patternRepeats.horizontal * 12).toFixed(0)}")</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-sm">Gap Between:</span>
                <span className="font-medium">{(config.width / config.patternRepeats.horizontal * 0.1).toFixed(2)}' ({(config.width / config.patternRepeats.horizontal * 0.1 * 12).toFixed(0)}")</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vertical Spacing</div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-sm">Section Height:</span>
                <span className="font-medium">{(config.height / config.patternRepeats.vertical).toFixed(2)}' ({(config.height / config.patternRepeats.vertical * 12).toFixed(0)}")</span>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-sm">Gap Between:</span>
                <span className="font-medium">{(config.height / config.patternRepeats.vertical * 0.1).toFixed(2)}' ({(config.height / config.patternRepeats.vertical * 0.1 * 12).toFixed(0)}")</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p className="mb-2"><span className="font-medium">Layout Tip:</span> For the most balanced look, center your pattern on the wall and work outward. Use these measurements as guides.</p>
            <p>Adjust spacing slightly as needed to ensure the pattern remains symmetrical, especially if your wall isn't perfectly square.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 