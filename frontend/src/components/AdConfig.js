import React, { createContext, useContext, useState, useEffect } from 'react';

// AdSense Configuration Context
const AdConfigContext = createContext();

export const AdConfigProvider = ({ children }) => {
  const [adConfig, setAdConfig] = useState({
    // Google AdSense Configuration
    publisherId: 'ca-pub-YOUR_PUBLISHER_ID', // Replace with your actual publisher ID
    adSlots: {
      banner: '1234567890',
      sidebar: '2345678901', 
      inFeed: '3456789012',
      native: '4567890123',
      mobileSticky: '5678901234',
      searchResults: '6789012345'
    },
    
    // Ad Display Settings
    showAds: true,
    showMobileSticky: true,
    showInFeedAds: true,
    maxInFeedAds: 3,
    adFrequency: 4, // Show ad every N listings
    
    // Test Mode
    testMode: process.env.NODE_ENV === 'development',
    
    // Targeting
    keywords: ['wohnmobil', 'caravan', 'camping', 'reisen', 'urlaub'],
    location: 'DE', // Germany
    
    // Ad Placement Rules
    placement: {
      homepage: {
        banner: true,
        sidebar: true,
        native: true
      },
      listings: {
        banner: true,
        inFeed: true,
        sidebar: true,
        searchResults: true
      },
      listingDetails: {
        banner: true,
        sidebar: true,
        native: true
      },
      userPages: {
        banner: false,
        sidebar: true,
        native: false
      }
    }
  });

  // Load AdSense script
  useEffect(() => {
    if (adConfig.showAds && adConfig.publisherId && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.publisherId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      
      return () => {
        // Cleanup script on unmount
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [adConfig.showAds, adConfig.publisherId]);

  const updateAdConfig = (newConfig) => {
    setAdConfig(prev => ({ ...prev, ...newConfig }));
  };

  const shouldShowAd = (page, adType) => {
    if (!adConfig.showAds) return false;
    return adConfig.placement[page]?.[adType] || false;
  };

  const getAdSlot = (adType) => {
    return adConfig.adSlots[adType] || '';
  };

  return (
    <AdConfigContext.Provider value={{
      adConfig,
      updateAdConfig,
      shouldShowAd,
      getAdSlot
    }}>
      {children}
    </AdConfigContext.Provider>
  );
};

export const useAdConfig = () => {
  const context = useContext(AdConfigContext);
  if (!context) {
    throw new Error('useAdConfig must be used within AdConfigProvider');
  }
  return context;
};

// Ad Performance Tracking
export const trackAdPerformance = (adType, action, data = {}) => {
  // Log ad performance for analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'ad_interaction', {
      ad_type: adType,
      action: action,
      ...data
    });
  }
  
  console.log(`Ad Performance: ${adType} - ${action}`, data);
};

// Ad Block Detection
export const detectAdBlock = () => {
  return new Promise((resolve) => {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    testAd.style.position = 'absolute';
    testAd.style.left = '-9999px';
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      const isBlocked = testAd.offsetHeight === 0;
      document.body.removeChild(testAd);
      resolve(isBlocked);
    }, 100);
  });
};

export default AdConfigContext;