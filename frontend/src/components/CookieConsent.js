// Cookie Consent Management für DSGVO-Compliance
import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Immer erforderlich
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie_consent', JSON.stringify(necessaryOnly));
    setPreferences(necessaryOnly);
    setShowBanner(false);
  };

  const savePreferences = () => {
    const savedPrefs = {
      ...preferences,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie_consent', JSON.stringify(savedPrefs));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-6 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between">
          <div className="md:flex-1 md:mr-8">
            <h3 className="text-lg font-semibold mb-2">🍪 Cookies & Datenschutz</h3>
            <p className="text-sm text-gray-300 mb-4">
              Wir verwenden Cookies und ähnliche Technologien, um Ihnen die bestmögliche Nutzererfahrung zu bieten. 
              Einige Cookies sind für die Funktionalität der Website erforderlich, andere helfen uns, die Website zu verbessern 
              und Ihnen personalisierte Inhalte anzuzeigen.
            </p>
            
            {/* Cookie-Kategorien */}
            <div className="space-y-2 mb-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="mr-2"
                />
                <span className="text-gray-400">Notwendige Cookies (erforderlich)</span>
              </label>
              
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({...preferences, functional: e.target.checked})}
                  className="mr-2"
                />
                <span>Funktionale Cookies (Benutzererfahrung)</span>
              </label>
              
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                  className="mr-2"
                />
                <span>Analytische Cookies (Statistiken)</span>
              </label>
              
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                  className="mr-2"
                />
                <span>Marketing Cookies (Werbung)</span>
              </label>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
            <button
              onClick={acceptNecessary}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
            >
              Nur Notwendige
            </button>
            <button
              onClick={savePreferences}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Auswahl Speichern
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Alle Akzeptieren
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-400">
          Weitere Informationen finden Sie in unserer{' '}
          <a href="/datenschutz" className="underline hover:text-white">Datenschutzerklärung</a> und den{' '}
          <a href="/agb" className="underline hover:text-white">AGB</a>.
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;