import React, { useState } from 'react';
import { useAdConfig } from './AdConfig';
import { useTranslation } from '../translations/TranslationContext';

const AdConfigPanel = () => {
  const { t } = useTranslation();
  const { adConfig, updateAdConfig } = useAdConfig();
  const [showPanel, setShowPanel] = useState(false);

  const handleConfigChange = (key, value) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      updateAdConfig({
        [parent]: {
          ...adConfig[parent],
          [child]: value
        }
      });
    } else {
      updateAdConfig({ [key]: value });
    }
  };

  const handlePlacementChange = (page, adType, value) => {
    updateAdConfig({
      placement: {
        ...adConfig.placement,
        [page]: {
          ...adConfig.placement[page],
          [adType]: value
        }
      }
    });
  };

  if (!showPanel) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowPanel(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
          title="Anzeigen-Einstellungen"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Anzeigen-Konfiguration</h2>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Global Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Globale Einstellungen</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Anzeigen aktivieren</label>
                <input
                  type="checkbox"
                  checked={adConfig.showAds}
                  onChange={(e) => handleConfigChange('showAds', e.target.checked)}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Test-Modus</label>
                <input
                  type="checkbox"
                  checked={adConfig.testMode}
                  onChange={(e) => handleConfigChange('testMode', e.target.checked)}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Mobile Sticky Ads</label>
                <input
                  type="checkbox"
                  checked={adConfig.showMobileSticky}
                  onChange={(e) => handleConfigChange('showMobileSticky', e.target.checked)}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">In-Feed Ads</label>
                <input
                  type="checkbox"
                  checked={adConfig.showInFeedAds}
                  onChange={(e) => handleConfigChange('showInFeedAds', e.target.checked)}
                  className="rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max In-Feed Ads</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={adConfig.maxInFeedAds}
                  onChange={(e) => handleConfigChange('maxInFeedAds', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ad-Frequenz (alle N Anzeigen)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={adConfig.adFrequency}
                  onChange={(e) => handleConfigChange('adFrequency', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Publisher ID */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Google AdSense</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Publisher ID</label>
              <input
                type="text"
                value={adConfig.publisherId}
                onChange={(e) => handleConfigChange('publisherId', e.target.value)}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Ad Slots */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Ad Slots</h3>
            <div className="space-y-3">
              {Object.entries(adConfig.adSlots).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleConfigChange(`adSlots.${key}`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Placement Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Anzeigen-Platzierung</h3>
            
            {Object.entries(adConfig.placement).map(([page, settings]) => (
              <div key={page} className="mb-4">
                <h4 className="font-medium mb-2 capitalize">{page}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(settings).map(([adType, enabled]) => (
                    <div key={adType} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${page}-${adType}`}
                        checked={enabled}
                        onChange={(e) => handlePlacementChange(page, adType, e.target.checked)}
                        className="mr-2 rounded"
                      />
                      <label htmlFor={`${page}-${adType}`} className="text-xs capitalize">
                        {adType.replace(/([A-Z])/g, ' $1')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Vorschau-Modus</h3>
            <div className="text-sm text-gray-600">
              {adConfig.testMode ? (
                <div className="bg-yellow-100 p-3 rounded">
                  <p className="font-medium text-yellow-800">Test-Modus aktiv</p>
                  <p className="text-yellow-700">Anzeigen werden als Platzhalter angezeigt</p>
                </div>
              ) : (
                <div className="bg-green-100 p-3 rounded">
                  <p className="font-medium text-green-800">Live-Modus aktiv</p>
                  <p className="text-green-700">Echte Anzeigen werden angezeigt</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={() => {
                console.log('Current Ad Config:', adConfig);
                alert('Konfiguration wurde in der Konsole ausgegeben');
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Config anzeigen
            </button>
            <button
              onClick={() => {
                updateAdConfig({
                  showAds: true,
                  testMode: true,
                  showMobileSticky: true,
                  showInFeedAds: true,
                  maxInFeedAds: 3,
                  adFrequency: 4
                });
                alert('Standard-Konfiguration wiederhergestellt');
              }}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
            >
              Zurücksetzen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdConfigPanel;