import { useEffect, useState } from 'react';

interface AdSenseProps {
  slot: string;
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  responsive?: boolean;
  style?: React.CSSProperties;
}

const AdSense: React.FC<AdSenseProps> = ({ slot, format = 'auto', responsive = true, style = {} }) => {
  const [adLoaded, setAdLoaded] = useState(false);
  
  useEffect(() => {
    try {
      // In development, don't try to load real ads
      if (process.env.NODE_ENV === 'production') {
        // Load Google AdSense script if it hasn't been loaded yet
        if (!(window as any).adsbygoogle) {
          const script = document.createElement('script');
          script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
          script.async = true;
          script.crossOrigin = 'anonymous';
          script.dataset.adClient = 'ca-pub-1234567890'; // Replace with your actual AdSense publisher ID
          document.head.appendChild(script);
        }
        
        // Initialize ads when the script is loaded
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
        setAdLoaded(true);
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);
  
  // Set default sizes based on format
  let defaultHeight = '250px';
  let defaultWidth = '100%';
  let placeholderText = 'Advertisement';
  
  if (format === 'horizontal') {
    defaultHeight = '90px';
    placeholderText = 'Horizontal Advertisement';
  } else if (format === 'vertical') {
    defaultHeight = '600px';
    defaultWidth = '160px';
    placeholderText = 'Vertical Advertisement';
  } else if (format === 'rectangle') {
    defaultHeight = '250px';
    defaultWidth = '300px';
    placeholderText = 'Rectangle Advertisement';
  }
  
  // In development or if ads aren't loaded yet, show a placeholder
  if (process.env.NODE_ENV !== 'production' || !adLoaded) {
    return (
      <div 
        className="ad-container my-4 border-2 border-dashed border-gray-300 bg-gray-100 flex items-center justify-center" 
        style={{
          height: style.minHeight || defaultHeight,
          width: style.width || defaultWidth,
          ...style
        }}
      >
        <div className="text-gray-500 text-center p-4">
          <div className="text-lg font-semibold mb-1">{placeholderText}</div>
          <div className="text-sm">Ad Slot: {slot}</div>
          {format !== 'auto' && <div className="text-sm">Format: {format}</div>}
        </div>
      </div>
    );
  }
  
  // Real ad unit for production
  return (
    <div className="ad-container my-4" style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client="ca-pub-1234567890" // Replace with your actual AdSense publisher ID
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

export default AdSense; 