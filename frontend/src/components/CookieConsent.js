// Cookie Consent Management für DSGVO-Compliance - Mobile Optimized
import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
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
    <>
      {/* Desktop Version */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-6 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:flex-1 md:mr-8">
              <h3 className="text-lg font-semibold mb-2">🍪 Cookies & Datenschutz</h3>
              <p className="text-sm text-gray-300 mb-4">
                Wir verwenden Cookies und ähnliche Technologien, um Ihnen die bestmögliche Nutzererfahrung zu bieten. 
                Einige Cookies sind für die Funktionalität der Website erforderlich, andere helfen uns, die Website zu verbessern 
                und Ihnen personalisierte Inhalte anzuzeigen.
              </p>
              
              {showDetails && (
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
              )}
            </div>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                {showDetails ? 'Weniger' : 'Einstellungen'}
              </button>
              <button
                onClick={acceptNecessary}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Nur Notwendige
              </button>
              {showDetails ? (
                <button
                  onClick={savePreferences}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Auswahl Speichern
                </button>
              ) : (
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Alle Akzeptieren
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
        <div className="bg-white w-full max-h-[90vh] overflow-y-auto rounded-t-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🍪 Cookies</h3>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Wir verwenden Cookies für die bestmögliche Nutzererfahrung. 
              Sie können Ihre Einstellungen anpassen.
            </p>

            {/* Cookie Categories - Mobile */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Notwendige Cookies</div>
                  <div className="text-xs text-gray-500">Erforderlich für Grundfunktionen</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  className="rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Funktionale Cookies</div>
                  <div className="text-xs text-gray-500">Verbesserte Benutzererfahrung</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.functional}
                  onChange={(e) => setPreferences({...preferences, functional: e.target.checked})}
                  className="rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Analytische Cookies</div>
                  <div className="text-xs text-gray-500">Statistiken und Analyse</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                  className="rounded border-gray-300"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-sm">Marketing Cookies</div>
                  <div className="text-xs text-gray-500">Personalisierte Werbung</div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                  className="rounded border-gray-300"
                />
              </div>
            </div>

            {/* Mobile Buttons */}
            <div className="space-y-3">
              <button
                onClick={acceptAll}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
              >
                Alle Akzeptieren
              </button>
              
              <button
                onClick={savePreferences}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Auswahl Speichern
              </button>
              
              <button
                onClick={acceptNecessary}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700"
              >
                Nur Notwendige
              </button>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              Weitere Informationen in unserer{' '}
              <a href="/datenschutz" className="text-blue-600 underline">Datenschutzerklärung</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;