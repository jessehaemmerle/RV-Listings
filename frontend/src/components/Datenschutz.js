import React from 'react';
import { useTranslation } from '../translations/TranslationContext';

const Datenschutz = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">1. Datenschutz auf einen Blick</h2>
          <h3 className="text-lg font-medium mb-2">Allgemeine Hinweise</h3>
          <p className="text-sm text-gray-600 mb-4">
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen 
            Daten passiert, wenn Sie unsere Website besuchen. Personenbezogene Daten sind alle Daten, 
            mit denen Sie persönlich identifiziert werden können.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. Verantwortliche Stelle</h2>
          <p className="text-sm text-gray-600 mb-2">
            Verantwortlich für die Datenverarbeitung auf dieser Website:
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>[IHR FIRMENNAME]</p>
            <p>[IHRE ADRESSE]</p>
            <p>[PLZ] [ORT], Österreich</p>
            <p>Telefon: [IHRE TELEFONNUMMER]</p>
            <p>E-Mail: [IHRE E-MAIL]</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. Datenerfassung auf unserer Website</h2>
          
          <h3 className="text-lg font-medium mb-2">Wer ist verantwortlich für die Datenerfassung?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. 
            Dessen Kontaktdaten können Sie dem Abschnitt "Verantwortliche Stelle" entnehmen.
          </p>

          <h3 className="text-lg font-medium mb-2">Wie erfassen wir Ihre Daten?</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
            <li>Daten, die Sie uns mitteilen (z.B. bei der Registrierung oder beim Erstellen von Anzeigen)</li>
            <li>Daten, die automatisch beim Besuch der Website erfasst werden (z.B. technische Daten)</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Wofür nutzen wir Ihre Daten?</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
            <li>Bereitstellung der Website und ihrer Funktionalitäten</li>
            <li>Erstellung und Verwaltung von Benutzerkonten</li>
            <li>Veröffentlichung von Fahrzeuganzeigen</li>
            <li>Vermittlung von Kontakten zwischen Käufern und Verkäufern</li>
            <li>Technische Administration der Website</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">4. Ihre Rechte</h2>
          <p className="text-sm text-gray-600 mb-2">
            Sie haben jederzeit das Recht:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
            <li><strong>Auskunft</strong> über Ihre gespeicherten personenbezogenen Daten</li>
            <li><strong>Berichtigung</strong> unrichtiger personenbezogener Daten</li>
            <li><strong>Löschung</strong> Ihrer personenbezogenen Daten</li>
            <li><strong>Einschränkung</strong> der Datenverarbeitung</li>
            <li><strong>Datenübertragbarkeit</strong> (Recht auf Herausgabe in strukturiertem Format)</li>
            <li><strong>Widerspruch</strong> gegen die Verarbeitung Ihrer personenbezogenen Daten</li>
            <li><strong>Beschwerde</strong> bei einer Aufsichtsbehörde</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">5. Registrierung und Benutzerkonten</h2>
          <h3 className="text-lg font-medium mb-2">Verarbeitete Daten</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
            <li>Benutzername und Passwort</li>
            <li>E-Mail-Adresse</li>
            <li>Vollständiger Name</li>
            <li>Telefonnummer (optional)</li>
            <li>Registrierungsdatum</li>
          </ul>
          
          <h3 className="text-lg font-medium mb-2">Rechtsgrundlage</h3>
          <p className="text-sm text-gray-600 mb-4">
            Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) - Die Datenverarbeitung ist zur 
            Erfüllung des Nutzungsvertrags erforderlich.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">6. Fahrzeuganzeigen</h2>
          <h3 className="text-lg font-medium mb-2">Verarbeitete Daten</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
            <li>Fahrzeugdaten (Marke, Modell, Jahr, etc.)</li>
            <li>Bilder des Fahrzeugs</li>
            <li>Standortdaten (Adresse, GPS-Koordinaten)</li>
            <li>Kontaktdaten des Verkäufers</li>
            <li>Preis und Beschreibung</li>
          </ul>

          <h3 className="text-lg font-medium mb-2">Veröffentlichung</h3>
          <p className="text-sm text-gray-600 mb-4">
            Ihre Anzeigendaten werden öffentlich auf der Website angezeigt. Kontaktdaten werden 
            nur bei berechtigtem Interesse (Kaufanfrage) an interessierte Käufer weitergegeben.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
          <p className="text-sm text-gray-600 mb-4">
            Unsere Website verwendet Cookies. Das sind kleine Textdateien, die auf Ihrem Gerät 
            gespeichert werden und bestimmte Einstellungen und Daten zum Austausch mit unserem 
            System über Ihren Browser speichern.
          </p>

          <h3 className="text-lg font-medium mb-2">Cookie-Kategorien</h3>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium">Notwendige Cookies</h4>
              <p className="text-sm text-gray-600">
                Diese Cookies sind für die Grundfunktionen der Website erforderlich und können 
                nicht deaktiviert werden.
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium">Funktionale Cookies</h4>
              <p className="text-sm text-gray-600">
                Diese Cookies ermöglichen erweiterte Funktionalitäten und Personalisierung.
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-medium">Analytische Cookies</h4>
              <p className="text-sm text-gray-600">
                Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">8. Server-Log-Dateien</h2>
          <p className="text-sm text-gray-600 mb-2">
            Der Provider der Website erhebt und speichert automatisch Informationen in Server-Log-Dateien:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
            <li>Browsertyp und Browserversion</li>
            <li>Verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
            <li>IP-Adresse</li>
          </ul>
          <p className="text-sm text-gray-600">
            Diese Daten werden nach 7 Tagen automatisch gelöscht.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">9. Kontakt und E-Mail</h2>
          <p className="text-sm text-gray-600 mb-4">
            Wenn Sie uns per E-Mail oder über das Kontaktformular kontaktieren, werden die 
            übermittelten Daten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen 
            bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">10. Datensicherheit</h2>
          <p className="text-sm text-gray-600 mb-4">
            Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure Socket Layer) 
            in Verbindung mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird. 
            Zusätzlich sichern wir unsere Website und sonstigen Systeme durch technische und organisatorische 
            Maßnahmen gegen Verlust, Zerstörung, Zugriff, Veränderung oder Verbreitung Ihrer Daten durch 
            unbefugte Personen.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">11. Ihre Rechte im Detail</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Auskunftsrecht (Art. 15 DSGVO)</h3>
              <p className="text-sm text-gray-600">
                Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob personenbezogene Daten 
                verarbeitet werden, sowie Auskunft über diese Daten und weitere Informationen.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Recht auf Berichtigung (Art. 16 DSGVO)</h3>
              <p className="text-sm text-gray-600">
                Sie haben das Recht, die Berichtigung unrichtiger personenbezogener Daten zu verlangen.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Recht auf Löschung (Art. 17 DSGVO)</h3>
              <p className="text-sm text-gray-600">
                Sie haben das Recht, die Löschung Ihrer personenbezogenen Daten zu verlangen, 
                sofern die Voraussetzungen erfüllt sind.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</h3>
              <p className="text-sm text-gray-600">
                Sie haben das Recht, Ihre personenbezogenen Daten in einem strukturierten, 
                gängigen und maschinenlesbaren Format zu erhalten.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">12. Kontakt für Datenschutzfragen</h2>
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm">
              Bei Fragen zum Datenschutz kontaktieren Sie uns unter:
            </p>
            <p className="font-medium mt-2">
              E-Mail: datenschutz@[ihre-domain].at<br/>
              Telefon: [IHRE TELEFONNUMMER]
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">13. Aufsichtsbehörde</h2>
          <p className="text-sm text-gray-600 mb-2">
            Sie haben das Recht, sich bei einer Datenschutzbehörde zu beschweren:
          </p>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium">Österreichische Datenschutzbehörde</p>
            <p className="text-sm">
              Barichgasse 40-42<br/>
              1030 Wien<br/>
              Telefon: +43 1 52 152-0<br/>
              E-Mail: dsb@dsb.gv.at<br/>
              Website: <a href="https://www.dsb.gv.at/" className="text-blue-600 hover:underline">www.dsb.gv.at</a>
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <p className="text-xs text-gray-500">
            Stand dieser Datenschutzerklärung: {new Date().toLocaleDateString('de-AT')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Datenschutz;