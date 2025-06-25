import React, { useEffect } from 'react';

// Google AdSense Component
const GoogleAd = ({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  style = {},
  className = '',
  adTest = false // Set to true for testing
}) => {
  useEffect(() => {
    try {
      // Load Google AdSense if not already loaded
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Don't render ads in development unless adTest is true
  if (process.env.NODE_ENV === 'development' && !adTest) {
    return (
      <div className={`bg-gray-100 border-2 border-dashed border-gray-300 p-4 text-center text-gray-500 ${className}`} style={style}>
        <div className="text-sm">📢 Google Anzeige (Entwicklungsmodus)</div>
        <div className="text-xs mt-1">Slot: {adSlot}</div>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID" // Replace with your actual publisher ID
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
        data-ad-test={adTest ? 'on' : 'off'}
      />
    </div>
  );
};

// Responsive Banner Ad Component
export const BannerAd = ({ className = '', adSlot = "1234567890" }) => {
  return (
    <div className={`my-6 ${className}`}>
      <div className="text-xs text-gray-400 text-center mb-2">Anzeige</div>
      <GoogleAd
        adSlot={adSlot}
        adFormat="auto"
        style={{ minHeight: '100px' }}
        className="w-full max-w-4xl mx-auto"
      />
    </div>
  );
};

// Sidebar Ad Component
export const SidebarAd = ({ className = '', adSlot = "2345678901" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="text-xs text-gray-400 text-center mb-3">Anzeige</div>
      <GoogleAd
        adSlot={adSlot}
        adFormat="vertical"
        style={{ minHeight: '250px', width: '300px' }}
        className="mx-auto"
      />
    </div>
  );
};

// In-Feed Ad Component (for between listings)
export const InFeedAd = ({ className = '', adSlot = "3456789012" }) => {
  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-md p-6 border border-blue-100 ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center space-x-2 text-blue-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">Gesponserte Inhalte</span>
        </div>
      </div>
      <GoogleAd
        adSlot={adSlot}
        adFormat="fluid"
        style={{ minHeight: '200px' }}
        className="w-full"
      />
    </div>
  );
};

// Native Ad Component (blends with content)
export const NativeAd = ({ className = '', adSlot = "4567890123", title = "Empfohlene Angebote" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          <span className="text-green-100 text-xs">Anzeige</span>
        </div>
      </div>
      <div className="p-4">
        <GoogleAd
          adSlot={adSlot}
          adFormat="fluid"
          style={{ minHeight: '150px' }}
          className="w-full"
        />
      </div>
    </div>
  );
};

// Mobile Sticky Bottom Ad
export const MobileStickyAd = ({ adSlot = "5678901234", show = true }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-between px-2 py-1">
        <div className="text-xs text-gray-400">Anzeige</div>
        <button 
          onClick={() => {
            // Hide functionality can be implemented by parent component
            console.log('Close ad clicked');
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <GoogleAd
        adSlot={adSlot}
        adFormat="auto"
        style={{ height: '50px' }}
        className="w-full"
      />
    </div>
  );
};

// Search Results Ad Component
export const SearchResultsAd = ({ className = '', adSlot = "6789012345" }) => {
  return (
    <div className={`border-l-4 border-yellow-400 bg-yellow-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-yellow-800 text-sm font-medium">Gesponserte Ergebnisse</span>
        </div>
      </div>
      <GoogleAd
        adSlot={adSlot}
        adFormat="fluid"
        style={{ minHeight: '180px' }}
        className="w-full"
      />
    </div>
  );
};

export default GoogleAd;