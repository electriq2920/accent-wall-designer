'use client';

import React, { useEffect } from 'react';

export default function AdSense({ slot, format = 'auto', responsive = true, style = {} }) {
  useEffect(() => {
    // Load Google AdSense script if it doesn't exist
    const hasScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');
    
    if (!hasScript) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      // Add your AdSense publisher ID here
      script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXX'); // Replace with actual publisher ID
      document.head.appendChild(script);
    }
    
    // Push the ad to AdSense when component mounts
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);
  
  const adStyle = {
    display: 'block',
    textAlign: 'center',
    ...style
  };
  
  return (
    <div className="ad-container my-4">
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with actual publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
      <div className="text-xs text-gray-400 text-center mt-1">Advertisement</div>
    </div>
  );
} 