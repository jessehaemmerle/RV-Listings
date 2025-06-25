import React, { useState } from 'react';
import { useAuth } from '../App';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const PrivacySettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const exportData = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await axios.get(`${API}/privacy/data-export`);
      
      // Create download link for JSON data
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `meine-daten-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage('Ihre Daten wurden erfolgreich exportiert.');
    } catch (error) {
      setMessage('Fehler beim Exportieren der Daten.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm(
      'Sind Sie sicher, dass Sie Ihr Konto löschen möchten? ' +
      'Diese Aktion kann nicht rückgängig gemacht werden. ' +
      'Alle Ihre Anzeigen werden ebenfalls gelöscht.'
    )) {
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      await axios.delete(`${API}/privacy/delete-account`);
      
      // Logout user after account deletion
      localStorage.removeItem('token');
      window.location.href = '/';
      
    } catch (error) {
      setMessage('Fehler beim Löschen des Kontos.');
    } finally {
      setLoading(false);
    }
  };

  const requestCorrection = async () => {
    const correctionText = prompt(
      'Bitte beschreiben Sie, welche Daten korrigiert werden sollen:'
    );
    
    if (!correctionText) return;

    try {
      setLoading(true);
      setMessage('');
      
      await axios.post(`${API}/privacy/data-correction`, {
        request: correctionText,
        user_id: user.id
      });
      
      setMessage('Ihre Korrekturanfrage wurde eingereicht und wird bearbeitet.');
    } catch (error) {
      setMessage('Fehler beim Senden der Korrekturanfrage.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Bitte melden Sie sich an, um auf die Datenschutz-Einstellungen zuzugreifen.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutz & Ihre Rechte</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.includes('Fehler') 
            ? 'bg-red-100 border border-red-400 text-red-700' 
            : 'bg-green-100 border border-green-400 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Data Export */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-3">📥 Datenexport (Art. 20 DSGVO)</h2>
          <p className="text-gray-600 mb-4">
            Sie haben das Recht, eine Kopie aller Ihrer personenbezogenen Daten zu erhalten, 
            die wir über Sie gespeichert haben.
          </p>
          <button
            onClick={exportData}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Exportiere...' : 'Meine Daten herunterladen'}
          </button>
        </div>

        {/* Data Correction */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-3">✏️ Datenkorrektur (Art. 16 DSGVO)</h2>
          <p className="text-gray-600 mb-4">
            Sie haben das Recht, die Berichtigung unrichtiger personenbezogener Daten zu verlangen.
          </p>
          <button
            onClick={requestCorrection}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Sendet...' : 'Datenkorrektur beantragen'}
          </button>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-3">👤 Ihre gespeicherten Daten</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Benutzername:</strong> {user.username}
            </div>
            <div>
              <strong>E-Mail:</strong> {user.email}
            </div>
            <div>
              <strong>Vollständiger Name:</strong> {user.full_name}
            </div>
            <div>
              <strong>Telefon:</strong> {user.phone || 'Nicht angegeben'}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Sie können diese Daten in Ihren Kontoeinstellungen bearbeiten.
          </p>
        </div>

        {/* Account Deletion */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-red-800">🗑️ Konto löschen (Art. 17 DSGVO)</h2>
          <p className="text-red-700 mb-4">
            Sie haben das Recht auf Löschung Ihrer personenbezogenen Daten. 
            <strong className="block mt-2">
              Achtung: Diese Aktion kann nicht rückgängig gemacht werden!
            </strong>
          </p>
          <ul className="text-sm text-red-600 mb-4 list-disc list-inside">
            <li>Ihr Benutzerkonto wird dauerhaft gelöscht</li>
            <li>Alle Ihre Anzeigen werden entfernt</li>
            <li>Ihre Daten werden anonymisiert</li>
            <li>Diese Aktion kann nicht rückgängig gemacht werden</li>
          </ul>
          <button
            onClick={deleteAccount}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Lösche...' : 'Konto dauerhaft löschen'}
          </button>
        </div>

        {/* Support Contact */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3 text-blue-800">📧 Datenschutz-Kontakt</h2>
          <p className="text-blue-700 mb-4">
            Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns:
          </p>
          <div className="text-sm text-blue-800">
            <p><strong>E-Mail:</strong> datenschutz@[ihre-domain].at</p>
            <p><strong>Telefon:</strong> +43 [IHRE NUMMER]</p>
            <p><strong>Post:</strong> [IHRE ADRESSE], [PLZ] [ORT], Österreich</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;