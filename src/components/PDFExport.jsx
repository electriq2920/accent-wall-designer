'use client';

import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';
import ReactMarkdown from 'react-markdown';
import { renderToString } from 'react-dom/server';

export default function PDFExport({ designRef, config, aiInstructions, id }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [instructions, setInstructions] = useState(null);
  
  // Generate instructions based on the design
  const generateInstructions = async () => {
    try {
      // If AI instructions are provided, use them
      if (aiInstructions) {
        setInstructions(aiInstructions);
        return aiInstructions;
      }
      
      // Otherwise, use predefined instructions based on the design type
      // In a production app, this would call an LLM API like OpenAI
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
        shiplap: `Install horizontally starting from the bottom. Use spacers to maintain consistent 1/8" gaps between boards. Ensure each board is level before nailing. Stagger joints for a more natural look.`
      };
      
      // Add specific measurements to the instructions
      let customInstructions = baseInstructions[config.mouldingType] || 
        "Mark your wall according to your design plan. Cut moulding pieces to the specified lengths and attach to the wall using construction adhesive and finish nails.";
      
      // Add material-specific information
      customInstructions += `\n\nMaterials needed: Based on the measurements, you'll need approximately `;
      
      // Calculate total materials (simplified version for demo)
      const pieces = calculateMouldingPieces(
        config.width, 
        config.height, 
        config.mouldingType, 
        config.patternRepeats
      );
      
      const materials = calculateTotalMaterials(pieces);
      
      materials.forEach(material => {
        const feetNeeded = (parseFloat(material.withWaste) / 12).toFixed(1);
        customInstructions += `${feetNeeded} feet of ${material.type.toLowerCase()} moulding, `;
      });
      
      customInstructions += "construction adhesive, finish nails, a level, measuring tape, and a miter saw.";
      
      // Add spacing information
      const spacing = pieces.find(p => p.spacing) ? `\n\nSpacing Information:\n${pieces.filter(p => p.spacing).map(p => `- ${p.spacingDescription}: ${p.spacing}"`).join('\n')}` : '';
      customInstructions += spacing;
      
      // Add finishing touches
      customInstructions += `\n\nFinishing: After installation, fill any nail holes with wood filler, sand smooth, and paint the moulding in your chosen color (${convertToHex(config.mouldingColor)}). For best results, use semi-gloss or satin finish paint.`;
      
      setInstructions(customInstructions);
      return customInstructions;
    } catch (error) {
      console.error('Error generating instructions:', error);
      return "Unable to generate custom instructions. Please refer to general moulding installation guidelines.";
    }
  };
  
  const handleExportPDF = async () => {
    if (!designRef.current) return;
    setIsGenerating(true);
    
    try {
      // Generate instructions if not already done
      const designInstructions = instructions || await generateInstructions();
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add SEO metadata to the PDF
      doc.setProperties({
        title: `Accent Wall Design - ${config.mouldingType.charAt(0).toUpperCase() + config.mouldingType.slice(1)} Pattern`,
        subject: 'Custom Accent Wall Design Plan with Measurements',
        author: 'Accent Wall Designer',
        keywords: `accent wall, ${config.mouldingType} pattern, wall design, interior design, ${config.width}x${config.height}, moulding, DIY`,
        creator: 'Accent Wall Designer Tool'
      });
      
      // Add page header with logo/branding
      doc.setFillColor(59, 130, 246); // Blue header
      doc.rect(0, 0, 210, 25, 'F');
      
      // Add title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text('Accent Wall Design Plan', 105, 15, { align: 'center' });
      
      // Reset text color for body content
      doc.setTextColor(0, 0, 0);
      
      // Add design info in a nice box
      doc.setFillColor(240, 249, 255); // Light blue background
      doc.rect(10, 30, 190, 40, 'F');
      doc.setDrawColor(59, 130, 246); // Blue border
      doc.rect(10, 30, 190, 40, 'S');
      
      doc.setFontSize(12);
      doc.text(`Wall Dimensions: ${config.width}ft × ${config.height}ft`, 15, 40);
      doc.text(`Moulding Type: ${config.mouldingType.charAt(0).toUpperCase() + config.mouldingType.slice(1)}`, 15, 47);
      doc.text(`Pattern Repeats: ${config.patternRepeats.horizontal} × ${config.patternRepeats.vertical}`, 15, 54);
      
      // Convert colors to hex for PDF display
      const accentHex = convertToHex(config.accentWallColor);
      const sideHex = convertToHex(config.sideWallColor);
      const mouldingHex = convertToHex(config.mouldingColor);
      
      doc.text(`Accent Wall Color: ${accentHex}`, 105, 40);
      doc.text(`Side Wall Color: ${sideHex}`, 105, 47);
      doc.text(`Moulding Color: ${mouldingHex}`, 105, 54);
      
      // Add colored rectangles showing the actual colors
      doc.setFillColor(parseInt(accentHex.slice(1, 3), 16), parseInt(accentHex.slice(3, 5), 16), parseInt(accentHex.slice(5, 7), 16));
      doc.rect(180, 37, 15, 6, 'F');
      
      doc.setFillColor(parseInt(sideHex.slice(1, 3), 16), parseInt(sideHex.slice(3, 5), 16), parseInt(sideHex.slice(5, 7), 16));
      doc.rect(180, 44, 15, 6, 'F');
      
      doc.setFillColor(parseInt(mouldingHex.slice(1, 3), 16), parseInt(mouldingHex.slice(3, 5), 16), parseInt(mouldingHex.slice(5, 7), 16));
      doc.rect(180, 51, 15, 6, 'F');
      
      // First, check for any button in the visualizer to set the front view
      try {
        // Set front view first (if the button exists)
        const frontViewButton = designRef.current.querySelector('button[title*="Front"]');
        if (frontViewButton) {
          console.log("Clicking front view button for better PDF capture");
          frontViewButton.click();
        }
      } catch (viewErr) {
        console.warn("Could not set front view:", viewErr);
      }
      
      // Wait a moment for the view to update
      setTimeout(async () => {
        try {
          // Find the specific Three.js canvas by ID
          const canvas = document.getElementById('threejs-canvas');
          
          if (canvas) {
            console.log("Found Three.js canvas by ID");
            try {
              // Get a snapshot of the Three.js canvas
              const imgData = canvas.toDataURL('image/png');
              
              // Add the image to the PDF
              const imgWidth = 180; // mm
              const imgHeight = (canvas.height * imgWidth) / canvas.width;
              doc.addImage(imgData, 'PNG', 15, 75, imgWidth, imgHeight);
              console.log("Canvas capture successful");
              
              // Continue with PDF generation
              completePDF(imgHeight);
            } catch (canvasErr) {
              console.error("Error capturing canvas:", canvasErr);
              fallbackCapture();
            }
          } else {
            console.log("Could not find Three.js canvas by ID, trying querySelector");
            const canvasByQuery = designRef.current.querySelector('canvas');
            
            if (canvasByQuery) {
              try {
                const imgData = canvasByQuery.toDataURL('image/png');
                const imgWidth = 180; // mm
                const imgHeight = (canvasByQuery.height * imgWidth) / canvasByQuery.width;
                doc.addImage(imgData, 'PNG', 15, 75, imgWidth, imgHeight);
                console.log("Canvas capture with querySelector successful");
                completePDF(imgHeight);
              } catch (queryErr) {
                console.error("Error capturing canvas with querySelector:", queryErr);
                fallbackCapture();
              }
            } else {
              console.log("No canvas found, falling back to html2canvas");
              fallbackCapture();
            }
          }
        } catch (err) {
          console.error("Overall error in canvas capture:", err);
          fallbackCapture();
        }
      }, 500); // Wait 500ms for the view to update
      
      // Fallback to html2canvas if direct canvas access fails
      const fallbackCapture = () => {
        console.log("Using html2canvas fallback");
        html2canvas(designRef.current, {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: true
        }).then(capturedCanvas => {
          try {
            const imgData = capturedCanvas.toDataURL('image/png');
            const imgWidth = 180; // mm
            const imgHeight = (capturedCanvas.height * imgWidth) / capturedCanvas.width;
            doc.addImage(imgData, 'PNG', 15, 75, imgWidth, imgHeight);
            console.log("html2canvas capture successful");
            completePDF(imgHeight);
          } catch (htmlCanvasErr) {
            console.error("Error processing html2canvas result:", htmlCanvasErr);
            addPlaceholderAndComplete();
          }
        }).catch(htmlErr => {
          console.error("Error with html2canvas:", htmlErr);
          addPlaceholderAndComplete();
        });
      };
      
      // Add placeholder text if image capture fails
      const addPlaceholderAndComplete = () => {
        console.log("All capture methods failed, adding placeholder text");
        doc.setFontSize(12);
        doc.setTextColor(255, 0, 0);
        doc.text("Visualization could not be captured. Please try again.", 15, 75);
        doc.setTextColor(0, 0, 0);
        completePDF(0); // No image height
      };
      
      // Complete the PDF with measurements and instructions
      const completePDF = (imageHeight = 0) => {
        // Add measurements section with proper spacing after image
        // Calculate position for measurements section
        const imgBottomY = 75 + (imageHeight || 0) + 15; // Increase padding from 10mm to 15mm
        const yPosition = Math.max(imgBottomY, 180); // Ensure minimum spacing
        
        // Add measurements section with blue header
        doc.setFillColor(59, 130, 246);
        doc.rect(10, yPosition - 8, 190, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text('Moulding Measurements', 105, yPosition, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        
        // Calculate measurements
        const pieces = calculateMouldingPieces(
          config.width, 
          config.height, 
          config.mouldingType, 
          config.patternRepeats
        );
        
        // Create table of measurements
        doc.setFontSize(10);
        let currentY = yPosition + 10;
        
        // Check if we need a new page for measurements
        if (yPosition > 240) { // If image takes too much space, start measurements on new page
          doc.addPage();
          currentY = 20;
          doc.setFontSize(16);
          doc.text('Moulding Measurements', 15, currentY);
          currentY += 10;
          doc.setFontSize(10);
        }
        
        // Table header
        doc.setFont(undefined, 'bold');
        doc.text('Pattern', 15, currentY);
        doc.text('Type', 70, currentY);
        doc.text('Length (in)', 110, currentY);
        doc.text('Quantity', 155, currentY);
        doc.setFont(undefined, 'normal');
        
        currentY += 7;
        
        // Table rows - only include actual moulding pieces, not spacing info
        pieces.filter(piece => piece.type !== 'Spacing').forEach((piece, index) => {
          // Check if we need a new page
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
            
            // Add header again
            doc.setFont(undefined, 'bold');
            doc.text('Pattern', 15, currentY);
            doc.text('Type', 70, currentY);
            doc.text('Length (in)', 110, currentY);
            doc.text('Quantity', 155, currentY);
            doc.setFont(undefined, 'normal');
            
            currentY += 7;
          }
          
          doc.text(piece.pattern, 15, currentY);
          doc.text(piece.type, 70, currentY);
          doc.text(`${piece.length}"`, 110, currentY);
          doc.text(piece.quantity.toString(), 155, currentY);
          
          currentY += 7;
        });
        
        // Add spacing information in a separate table if available
        const spacingPieces = pieces.filter(piece => piece.type === 'Spacing');
        if (spacingPieces.length > 0) {
          currentY += 10;
          
          // Check if we need a new page
          if (currentY > 250) {
            doc.addPage();
            currentY = 20;
          }
          
          doc.setFontSize(16);
          doc.setFont(undefined, 'bold');
          doc.text('Spacing Information', 15, currentY);
          doc.setFont(undefined, 'normal');
          
          currentY += 10;
          doc.setFontSize(10);
          
          // Spacing table
          doc.setFont(undefined, 'bold');
          doc.text('Description', 15, currentY);
          doc.text('Measurement (in)', 120, currentY);
          doc.setFont(undefined, 'normal');
          
          currentY += 7;
          
          spacingPieces.forEach(piece => {
            // Check if we need a new page
            if (currentY > 270) {
              doc.addPage();
              currentY = 20;
              
              // Add header again
              doc.setFont(undefined, 'bold');
              doc.text('Description', 15, currentY);
              doc.text('Measurement (in)', 120, currentY);
              doc.setFont(undefined, 'normal');
              
              currentY += 7;
            }
            
            doc.text(piece.spacingDescription, 15, currentY);
            doc.text(`${piece.spacing}"`, 120, currentY);
            
            currentY += 7;
          });
        }
        
        // Total materials
        currentY += 5;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Total Materials (with 10% waste)', 15, currentY);
        doc.setFont(undefined, 'normal');
        
        currentY += 7;
        
        const materials = calculateTotalMaterials(pieces);
        materials.forEach(material => {
          doc.text(`${material.type}: ${material.withWaste}" (${(material.withWaste / 12).toFixed(1)} ft)`, 15, currentY);
          currentY += 7;
        });
        
        // Add instructions section in a styled box
        currentY += 10;
        
        // If we're close to the bottom of the page, add a new page for instructions
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }
        
        // Add instructions section with blue header
        doc.setFillColor(59, 130, 246);
        doc.rect(10, currentY, 190, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text('Installation Instructions', 105, currentY + 7, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        
        currentY += 20;
        
        // Format instructions with proper line spacing for readability
        const maxWidth = 180;
        doc.setFontSize(10);
        
        // Check if instructions are in markdown format
        const isMarkdown = designInstructions.includes('#') || 
                          designInstructions.includes('*') || 
                          designInstructions.includes('- ');
        
        if (isMarkdown) {
          // Render the markdown content to plain text
          try {
            // Use renderToString to convert ReactMarkdown to HTML/text
            const renderedContent = renderToString(<ReactMarkdown>{designInstructions}</ReactMarkdown>);
            
            // Strip HTML tags to get clean text
            const plainText = renderedContent.replace(/<[^>]*>?/gm, '')
                                           .replace(/&lt;/g, '<')
                                           .replace(/&gt;/g, '>')
                                           .replace(/&quot;/g, '"')
                                           .replace(/&amp;/g, '&');
                                           
            // Split into paragraphs
            const paragraphs = plainText.split(/\n\s*\n/);
            
            paragraphs.forEach(paragraph => {
              if (paragraph.trim()) {
                if (currentY > 270) {
                  doc.addPage();
                  currentY = 20;
                }
                
                // Check if it's a heading
                if (/^[A-Z][\w\s:]+$/.test(paragraph.trim())) {
                  doc.setFontSize(12);
                  doc.setFont(undefined, 'bold');
                  doc.text(paragraph.trim(), 15, currentY);
                  doc.setFont(undefined, 'normal');
                  doc.setFontSize(10);
                  currentY += 8;
                }
                // Check if it's a bullet point
                else if (paragraph.trim().startsWith('•')) {
                  const bulletText = paragraph.trim();
                  const lines = doc.splitTextToSize(bulletText, maxWidth - 5);
                  doc.text(lines, 20, currentY); // Indented bullet points
                  currentY += lines.length * 5 + 2;
                }
                // Regular paragraph
                else {
                  const lines = doc.splitTextToSize(paragraph.trim(), maxWidth);
                  doc.text(lines, 15, currentY);
                  currentY += lines.length * 5 + 3;
                }
              }
            });
          } catch (error) {
            console.error('Error processing markdown:', error);
            // Fallback to simple text
            const lines = doc.splitTextToSize(designInstructions, maxWidth);
            doc.text(lines, 15, currentY);
            currentY += lines.length * 5;
          }
        } else {
          // Handle standard text (non-markdown)
          // Wrap and add the instructions text with enhanced spacing
          const formattedInstructions = designInstructions.split('\n\n');
          formattedInstructions.forEach(paragraph => {
            if (currentY > 270) {
              doc.addPage();
              currentY = 20;
            }
            
            const lines = doc.splitTextToSize(paragraph, maxWidth);
            doc.text(lines, 15, currentY);
            currentY += lines.length * 5 + 5; // Add extra spacing between paragraphs
          });
        }
        
        // Add footer
        const totalPages = doc.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`Designed with Accent Wall Designer - Page ${i} of ${totalPages}`, 105, 290, { align: 'center' });
        }
        
        // Save the PDF
        doc.save(`accent-wall-${config.mouldingType}-${config.width}x${config.height}.pdf`);
        setIsGenerating(false);
      };
      
      // Note: The function returns here without completing the PDF
      // The async setTimeout callbacks will handle PDF completion
      return;
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Failed to create PDF. Please try again.');
      setIsGenerating(false);
    }
  };
  
  return (
    <button
      id={id}
      onClick={handleExportPDF}
      className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors"
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
          Generating PDF...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to PDF
        </>
      )}
    </button>
  );
}

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
      const classicHorizontalSpacing = widthInches / horizontalRepeats;
      const classicVerticalSpacing = heightInches / verticalRepeats;
      const classicFrameWidth = widthInches / horizontalRepeats * 0.85;
      const classicFrameHeight = heightInches / verticalRepeats * 0.85;
      const classicHorizontalMargin = (widthInches / horizontalRepeats - classicFrameWidth) / 2;
      const classicVerticalMargin = (heightInches / verticalRepeats - classicFrameHeight) / 2;
      
      for (let h = 0; h < horizontalRepeats; h++) {
        for (let v = 0; v < verticalRepeats; v++) {
          pieces.push({ 
            type: 'Horizontal', 
            length: classicFrameWidth.toFixed(1), 
            quantity: 2,
            pattern: `Frame ${h+1}-${v+1}`
          });
          pieces.push({ 
            type: 'Vertical', 
            length: classicFrameHeight.toFixed(1), 
            quantity: 2,
            pattern: `Frame ${h+1}-${v+1}`
          });
        }
      }
      
      // Add spacing information
      pieces.push({
        type: 'Spacing',
        spacing: `${classicHorizontalSpacing.toFixed(1)}`,
        spacingDescription: 'Distance between frame centers horizontally',
        pattern: 'Layout Spacing'
      });
      pieces.push({
        type: 'Spacing',
        spacing: `${classicVerticalSpacing.toFixed(1)}`,
        spacingDescription: 'Distance between frame centers vertically',
        pattern: 'Layout Spacing'
      });
      pieces.push({
        type: 'Spacing',
        spacing: `${classicHorizontalMargin.toFixed(1)}`,
        spacingDescription: 'Margin from grid line to frame edge (horizontal)',
        pattern: 'Layout Spacing'
      });
      pieces.push({
        type: 'Spacing',
        spacing: `${classicVerticalMargin.toFixed(1)}`,
        spacingDescription: 'Margin from grid line to frame edge (vertical)',
        pattern: 'Layout Spacing'
      });
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
      
    case 'herringbone':
      // For herringbone pattern, calculate actual sizes
      const herringboneWidth = widthInches / horizontalRepeats;
      const herringboneHeight = heightInches / verticalRepeats;
      
      // Each herringbone piece has a diagonal length
      const herringbonePieceLength = Math.sqrt(herringboneWidth**2 + herringboneHeight**2);
      
      pieces.push({ 
        type: 'Herringbone Pieces', 
        length: herringbonePieceLength.toFixed(1), 
        quantity: 20 * horizontalRepeats * verticalRepeats, // 10 "V" shapes per pattern
        pattern: 'Herringbone Pattern'
      });
      break;
      
    case 'coffered':
      // For coffered pattern, calculate actual sizes
      const cofferedWidth = widthInches / horizontalRepeats;
      const cofferedHeight = heightInches / verticalRepeats;
      
      // Each coffered piece has a diagonal length
      const cofferedPieceLength = Math.sqrt(cofferedWidth**2 + cofferedHeight**2);
      
      pieces.push({ 
        type: 'Coffered Pieces', 
        length: cofferedPieceLength.toFixed(1), 
        quantity: 20 * horizontalRepeats * verticalRepeats, // 10 "V" shapes per pattern
        pattern: 'Coffered Pattern'
      });
      break;
      
    case 'wainscoting':
      // For wainscoting pattern, calculate actual sizes
      const wainscotingWidth = widthInches / horizontalRepeats;
      const wainscotingHeight = heightInches / verticalRepeats;
      
      // Each wainscoting piece has a diagonal length
      const wainscotingPieceLength = Math.sqrt(wainscotingWidth**2 + wainscotingHeight**2);
      
      pieces.push({ 
        type: 'Wainscoting Pieces', 
        length: wainscotingPieceLength.toFixed(1), 
        quantity: 20 * horizontalRepeats * verticalRepeats, // 10 "V" shapes per pattern
        pattern: 'Wainscoting Pattern'
      });
      break;
      
    case 'shiplap':
      // For shiplap pattern, calculate actual sizes
      const shiplapWidth = widthInches / horizontalRepeats;
      const shiplapHeight = heightInches / verticalRepeats;
      
      // Each shiplap piece has a diagonal length
      const shiplapPieceLength = Math.sqrt(shiplapWidth**2 + shiplapHeight**2);
      
      pieces.push({ 
        type: 'Shiplap Pieces', 
        length: shiplapPieceLength.toFixed(1), 
        quantity: 20 * horizontalRepeats * verticalRepeats, // 10 "V" shapes per pattern
        pattern: 'Shiplap Pattern'
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
  // Group by type, but only include numeric lengths
  const byType = pieces.reduce((acc, piece) => {
    const type = piece.type;
    // Skip spacing information and non-numeric lengths
    if (type === 'Spacing' || piece.length === 'Custom sizes') {
      return acc;
    }
    
    if (!acc[type]) acc[type] = 0;
    
    const length = parseFloat(piece.length);
    if (!isNaN(length)) {
      acc[type] += length * piece.quantity;
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

// Helper function to convert color to hex
const convertToHex = (color) => {
  try {
    console.log('Converting color:', color);
    
    // For hex colors, just return them
    if (color.startsWith('#')) {
      console.log('Already hex:', color);
      return color;
    }
    
    // For oklch colors, try to provide a fallback
    if (color.startsWith('oklch')) {
      console.log('Converting oklch color:', color);
      // Default fallbacks for common colors
      if (color.includes('100%') || color.includes('1 0')) {
        return '#FFFFFF'; // White
      } else if (color.includes('0%') || color.includes('0 0')) {
        return '#000000'; // Black
      }
    }
    
    // For other formats (rgb, oklch, etc.), create a temporary element to convert
    const tempEl = document.createElement('div');
    tempEl.style.color = color;
    document.body.appendChild(tempEl);
    const computedColor = window.getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);
    console.log('Computed color:', computedColor);
    
    // Convert rgb format to hex
    if (computedColor.startsWith('rgb')) {
      const rgbValues = computedColor.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        const r = parseInt(rgbValues[0]);
        const g = parseInt(rgbValues[1]);
        const b = parseInt(rgbValues[2]);
        const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        console.log('Converted to hex:', hexColor);
        return hexColor;
      }
    }
    
    console.log('Falling back to default color');
    return '#000000'; // Default to black if conversion fails
  } catch (e) {
    console.error('Color conversion error:', e);
    return '#000000'; // Default to black on error
  }
}; 