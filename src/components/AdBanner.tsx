'use client';

export default function AdBanner() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center space-y-3">
        <p className="text-sm text-gray-500">Advertisement</p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-md p-10 bg-gray-50">
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="font-semibold text-gray-700">
              Premium Moulding &amp; Design Materials
            </p>
            <p className="text-sm text-gray-500 max-w-md">
              Get high-quality materials for your accent wall project. Professional-grade mouldings, paints, and installation tools.
            </p>
            <a 
              href="#"
              className="mt-2 bg-amber-500 text-white py-2 px-4 rounded hover:bg-amber-600 inline-block text-sm font-medium"
              onClick={(e) => {
                e.preventDefault();
                // In a real application, this would track the ad click
                console.log('Ad clicked');
                alert('This would navigate to a sponsor site in a real application.');
              }}
            >
              Shop Materials
            </a>
          </div>
        </div>
        
        <p className="text-xs text-gray-400">
          This free tool is supported by ads. Thank you for your understanding.
        </p>
      </div>
    </div>
  );
} 