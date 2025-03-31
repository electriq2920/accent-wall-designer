'use client';

import { useRef, useState } from 'react';
import EnhancedRoomVisualizer from '@/components/EnhancedRoomVisualizer';
import DesignMeasurements from '@/components/DesignMeasurements';
import PDFExport from '@/components/PDFExport';
import InstructionsGenerator from '@/components/InstructionsGenerator';
import AdSense from '@/components/AdSense';
import Navbar from '@/components/Navbar';

export default function Home() {
  const designRef = useRef(null);
  const [aiInstructions, setAiInstructions] = useState('');
  const [isGeneratingInstructions, setIsGeneratingInstructions] = useState(false);
  const [config, setConfig] = useState({
    width: 12,
    height: 8,
    accentWallColor: '#E8D3B9', // Warm beige for accent wall
    sideWallColor: '#F5EEE6', // Light cream for side walls
    mouldingColor: '#FFFFFF', // Pure white for moulding
    mouldingType: 'classic',
    mouldingWidth: 0.05, // 5% of wall width
    patternRepeats: {
      horizontal: 2,
      vertical: 2
    },
    roomType: 'livingRoom'
  });
  
  // Handle form field changes
  const handleFieldChange = (field: string, value: string | number) => {
    setConfig({
      ...config,
      [field]: value
    });
  };
  
  // Handle pattern repeat changes
  const handlePatternChange = (direction: 'horizontal' | 'vertical', value: number) => {
    setConfig({
      ...config,
      patternRepeats: {
        ...config.patternRepeats,
        [direction]: value
      }
    });
  };
  
  // Handle instructions generation callback
  const handleInstructionsGenerated = (instructions: string, isLoading: boolean = false) => {
    setIsGeneratingInstructions(isLoading);
    if (!isLoading && instructions) {
      setAiInstructions(instructions);
    }
  };
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-2xl bg-blue-600 text-white mb-12 mt-20">
            <div className="absolute inset-0 opacity-20 bg-[url('/pattern-bg.svg')] bg-repeat"></div>
            <div className="relative z-10 px-6 py-12 md:py-16 md:px-12 flex flex-col items-center text-center">
              <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                Custom Accent Wall Designer
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 mb-8">
                Design beautiful accent walls with precise measurements, realistic 3D preview, and professional PDF plans.
              </p>
              <button 
                onClick={() => document.getElementById('designer-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-600 px-8 py-3 rounded-full font-medium shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Start Designing
              </button>
            </div>
          </section>
          
          {/* Main Design Section */}
          <section id="designer-section" className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 bg-gray-50 p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Wall Configuration</h2>
                  <div className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                    Live Preview
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                      Wall Width (ft)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="6"
                        max="20"
                        value={config.width}
                        onChange={(e) => handleFieldChange('width', Number(e.target.value))}
                        className="w-full mr-2 accent-blue-600"
                        aria-label="Wall Width"
                      />
                      <span className="w-12 h-8 flex items-center justify-center bg-gray-100 rounded-md text-center font-medium">
                        {config.width}
                      </span>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                      Wall Height (ft)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="6"
                        max="16"
                        value={config.height}
                        onChange={(e) => handleFieldChange('height', Number(e.target.value))}
                        className="w-full mr-2 accent-blue-600"
                        aria-label="Wall Height"
                      />
                      <span className="w-12 h-8 flex items-center justify-center bg-gray-100 rounded-md text-center font-medium">
                        {config.height}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Wall Colors</label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-500">Accent Wall</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.accentWallColor}
                            onChange={(e) => handleFieldChange('accentWallColor', e.target.value)}
                            className="h-8 w-12 rounded cursor-pointer border"
                            aria-label="Accent Wall Color"
                          />
                          <span className="text-xs">{config.accentWallColor}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-500">Side Wall</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.sideWallColor}
                            onChange={(e) => handleFieldChange('sideWallColor', e.target.value)}
                            className="h-8 w-12 rounded cursor-pointer border"
                            aria-label="Side Wall Color"
                          />
                          <span className="text-xs">{config.sideWallColor}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-500">Moulding</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={config.mouldingColor}
                            onChange={(e) => handleFieldChange('mouldingColor', e.target.value)}
                            className="h-8 w-12 rounded cursor-pointer border"
                            aria-label="Moulding Color"
                          />
                          <span className="text-xs">{config.mouldingColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Moulding Type</label>
                    <select
                      value={config.mouldingType}
                      onChange={(e) => handleFieldChange('mouldingType', e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2.5 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Moulding Type"
                    >
                      <option value="classic">Classic</option>
                      <option value="modern">Modern</option>
                      <option value="geometric">Geometric</option>
                      <option value="diamond">Diamond</option>
                      <option value="rectangular">Rectangular</option>
                      <option value="grid">Grid</option>
                      <option value="chevron">Chevron</option>
                      <option value="herringbone">Herringbone</option>
                      <option value="coffered">Coffered</option>
                      <option value="wainscoting">Wainscoting</option>
                      <option value="shiplap">Shiplap</option>
                      <option value="diagonalCross">Diagonal Cross</option>
                      <option value="verticalSlat">Vertical Slat</option>
                      <option value="geometricSquares">Geometric Squares</option>
                    </select>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-600 transition-colors">
                      Moulding Width
                    </label>
                    <div className="flex items-center">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={config.mouldingWidth * 100}
                        onChange={(e) => handleFieldChange('mouldingWidth', Number(e.target.value) / 100)}
                        className="w-full mr-2 accent-blue-600"
                        aria-label="Moulding Width"
                      />
                      <span className="w-12 h-8 flex items-center justify-center bg-gray-100 rounded-md text-center font-medium">
                        {Math.round(config.mouldingWidth * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-xl shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Pattern Repeats</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-500">Horizontal</label>
                        <div className="flex items-center">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={config.patternRepeats.horizontal}
                            onChange={(e) => handlePatternChange('horizontal', Number(e.target.value))}
                            className="w-full mr-2 accent-blue-600"
                            aria-label="Horizontal Pattern Repeats"
                          />
                          <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md text-center font-medium">
                            {config.patternRepeats.horizontal}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-xs text-gray-500">Vertical</label>
                        <div className="flex items-center">
                          <input
                            type="range"
                            min="1"
                            max="4"
                            value={config.patternRepeats.vertical}
                            onChange={(e) => handlePatternChange('vertical', Number(e.target.value))}
                            className="w-full mr-2 accent-blue-600"
                            aria-label="Vertical Pattern Repeats"
                          />
                          <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md text-center font-medium">
                            {config.patternRepeats.vertical}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                    <select
                      value={config.roomType}
                      onChange={(e) => handleFieldChange('roomType', e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2.5 text-sm bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Room Type"
                    >
                      <option value="livingRoom">Living Room</option>
                      <option value="bedroom">Bedroom</option>
                      <option value="office">Office</option>
                      <option value="diningRoom">Dining Room</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-3">
                <div className="flex flex-col h-full">
                  <div 
                    ref={designRef} 
                    className="w-full h-[500px] md:h-[600px]"
                  >
                    <EnhancedRoomVisualizer
                      config={config}
                    />
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                      <button
                        onClick={() => document.getElementById('instructions-heading')?.scrollIntoView({ behavior: 'smooth' })}
                        className="flex items-center justify-center px-6 py-3 rounded-md shadow-sm bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Plans
                      </button>
                      <button
                        onClick={() => {
                          if (aiInstructions) {
                            // Find the PDFExport component and trigger its export function
                            document.getElementById('pdf-export-button')?.click();
                          }
                        }}
                        disabled={!aiInstructions || isGeneratingInstructions}
                        className={`flex items-center justify-center px-6 py-3 rounded-md shadow-sm ${
                          aiInstructions && !isGeneratingInstructions
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        } transition-colors`}
                      >
                        {isGeneratingInstructions ? (
                          <>
                            <div className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-gray-600 rounded-full"></div>
                            Loading Plans
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Plans
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ad placement below the visualization */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <AdSense 
                slot="1234567890" 
                format="auto" 
                responsive={true} 
                style={{ display: 'block', minHeight: '250px' }} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 mt-6">
              <section aria-labelledby="measurements-heading" className="bg-white p-6 rounded-xl shadow-sm">
                <h2 id="measurements-heading" className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Measurements & Details
                </h2>
                <DesignMeasurements config={config} />
              </section>
              
              <section aria-labelledby="instructions-heading" className="bg-white p-6 rounded-xl shadow-sm">
                <h2 id="instructions-heading" className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Installation Instructions
                </h2>
                <InstructionsGenerator 
                  config={config} 
                  onInstructionsGenerated={handleInstructionsGenerated}
                />
              </section>
            </div>
            
            {/* Hidden PDF Export component */}
            <div className="hidden">
              <PDFExport 
                id="pdf-export-button"
                config={config} 
                designRef={designRef} 
                aiInstructions={aiInstructions}
              />
            </div>
          </section>
          
          {/* Popular Patterns Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Popular Accent Wall Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['classic', 'diamond', 'grid', 'herringbone'].map((pattern) => (
                <div 
                  key={pattern}
                  className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => handleFieldChange('mouldingType', pattern)}
                >
                  <div className="h-48 bg-blue-50 flex items-center justify-center">
                    <div className="w-32 h-32 bg-blue-100 rounded-lg relative">
                      {/* Pattern preview would go here */}
                      <div className="absolute inset-0 flex items-center justify-center text-blue-800 capitalize font-medium">
                        {pattern}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 capitalize">{pattern} Pattern</h3>
                    <p className="text-sm text-gray-500 mt-1">Click to apply this pattern</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {/* Second Ad Placement */}
          <div className="mb-12">
            <AdSense 
              slot="5678901234" 
              format="auto" 
              responsive={true} 
              style={{ display: 'block', minHeight: '250px' }} 
            />
          </div>
          
          {/* FAQ Section */}
          <section className="bg-white rounded-2xl shadow-md p-8 mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">What is an accent wall?</h3>
                <p className="text-gray-600">An accent wall is a single wall in a room that features a different design, color, or texture than the other walls, creating a focal point in the space.</p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">What materials do I need?</h3>
                <p className="text-gray-600">Typically, you'll need wood moulding pieces, nails, wood glue, paint, measuring tape, level, miter saw, and basic tools. Our designs provide exact measurements and material lists.</p>
              </div>
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">How long does installation take?</h3>
                <p className="text-gray-600">Installation time varies based on the complexity of the design. Simple patterns might take a weekend, while more intricate designs could take 2-3 days.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Accent Wall Designer</h3>
              <p className="text-gray-400">Create beautiful DIY accent walls with precise measurements and professional instructions.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="/gallery" className="text-gray-400 hover:text-white transition-colors">Gallery</a></li>
                <li><a href="/tutorials" className="text-gray-400 hover:text-white transition-colors">Tutorials</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Stay Updated</h3>
              <div className="flex">
                <input type="email" placeholder="Your email" className="px-4 py-2 rounded-l-md text-gray-900 w-full" />
                <button className="bg-blue-600 px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors">Subscribe</button>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Accent Wall Designer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
