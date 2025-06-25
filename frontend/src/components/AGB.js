import React from 'react';
import { useTranslation } from '../translations/TranslationContext';

const AGB = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">§ 1 Geltungsbereich</h2>
          <p className="text-sm text-gray-600 mb-4">
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Website 
            [IHRE DOMAIN] und der darüber angebotenen Dienstleistungen. Betreiber der Website ist 
            [IHR FIRMENNAME], [IHRE ADRESSE], [PLZ] [ORT], Österreich.
          </p>
          <p className="text-sm text-gray-600">
            Abweichende Bedingungen des Nutzers werden nicht anerkannt, es sei denn, 
            wir stimmen ihrer Geltung ausdrücklich schriftlich zu.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">§ 2 Beschreibung der Dienstleistung</h2>
          <p className="text-sm text-gray-600 mb-4">
            Wir betreiben eine Online-Plattform für den Verkauf und Kauf von Wohnmobilen, 
            Wohnwagen und Campervans. Die Plattform ermöglicht es registrierten Nutzern:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
            <li>Fahrzeuganzeigen zu erstellen und zu veröffentlichen</li>
            <li>Nach Fahrzeugen zu suchen und zu browsen</li>
            <li>Kontakt mit Verkäufern aufzunehmen</li>
            <li>Ihre eigenen Anzeigen zu verwalten</li>
          </ul>
          <p className="text-sm text-gray-600">
            Wir sind Vermittler und nicht Vertragspartei bei Kaufverträgen zwischen Nutzern.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">§ 3 Registrierung und Nutzerkonto</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-medium mb-2">3.1 Registrierung</h3>
              <p className="text-sm text-gray-600">
                Die Nutzung der Plattform erfordert eine kostenlose Registrierung. 
                Bei der Registrierung sind wahrheitsgemäße und vollständige Angaben zu machen.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">3.2 Nutzerkonto</h3>
              <p className="text-sm text-gray-600">
                Der Nutzer ist verpflichtet, seine Zugangsdaten vertraulich zu behandeln und 
                bei Missbrauch unverzüglich zu melden. Der Nutzer haftet für alle Aktivitäten 
                unter seinem Nutzerkonto.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">3.3 Sperrung</h3>
              <p className="text-sm text-gray-600">
                Wir behalten uns das Recht vor, Nutzerkonten bei Verstößen gegen diese AGB 
                oder geltendes Recht zu sperren oder zu löschen.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">§ 4 Anzeigen und Inhalte</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-medium mb-2">4.1 Anzeigenerstellung</h3>
              <p className="text-sm text-gray-600">
                Nutzer können kostenlos Anzeigen für Fahrzeuge erstellen. Die Angaben müssen 
                wahrheitsgemäß und vollständig sein. Falsche oder irreführende Angaben sind untersagt.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">4.2 Verbotene Inhalte</h3>
              <p className="text-sm text-gray-600 mb-2">Folgende Inhalte sind untersagt:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Anzeigen für gestohlene oder nicht verkehrssichere Fahrzeuge</li>
                <li>Diskriminierende, beleidigende oder rechtswidrige Inhalte</li>
                <li>Spam oder kommerzielle Massenwerbung</li>
                <li>Inhalte, die Rechte Dritter verletzen</li>
                <li>Anzeigen ohne tatsächliche Verkaufsabsicht</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">4.3 Bilder</h3>
              <p className="text-sm text-gray-600">
                Hochgeladene Bilder müssen das beworbene Fahrzeug zeigen und dürfen keine 
                Rechte Dritter verletzen. Der Nutzer versichert, dass er die erforderlichen 
                Rechte an den Bildern besitzt.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">4.4 Moderation</h3>
              <p className="text-sm text-gray-600">
                Wir behalten uns das Recht vor, Anzeigen ohne Angabe von Gründen zu löschen 
                oder zu bearbeiten, insbesondere bei Verstößen gegen diese AGB.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">§ 5 Haftung und Gewährleistung</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-medium mb-2">5.1 Plattformhaftung</h3>
              <p className="text-sm text-gray-600">
                Wir haften nicht für die Richtigkeit der Anzeigen oder die Qualität der 
                beworbenen Fahrzeuge. Die Verantwortung liegt beim jeweiligen Verkäufer.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">5.2 Verfügbarkeit</h3>
              <p className="text-sm text-gray-600">
                Wir bemühen uns um eine möglichst hohe Verfügbarkeit der Plattform, 
                können aber keine 100%ige Verfügbarkeit garantieren.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">5.3 Haftungsbeschränkung</h3>
              <p className="text-sm text-gray-600">
                Unsere Haftung ist auf Vorsatz und grobe Fahrlässigkeit beschränkt. 
                Die Haftung für mittelbare Schäden und entgangenen Gewinn ist ausgeschlossen, 
                soweit gesetzlich zulässig.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">§ 6 Datenschutz</h2>
          <p className="text-sm text-gray-600">
            Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung, 
            die Sie unter <a href="/datenschutz" className="text-blue-600 hover:underline">/datenschutz</a> einsehen können.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">§ 7 Vertragsbeziehung zwischen Nutzern</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-medium mb-2">7.1 Kaufverträge</h3>
              <p className="text-sm text-gray-600">
                Kaufverträge kommen ausschließlich zwischen Verkäufer und Käufer zustande. 
                Wir sind nicht Vertragspartei und übernehmen keine Gewährleistung für die Abwicklung.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">7.2 Streitigkeiten</h3>
              <p className="text-sm text-gray-600">
                Bei Streitigkeiten zwischen Nutzern können wir vermittelnd tätig werden, 
                sind dazu aber nicht verpflichtet.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">§ 8 Beendigung der Nutzung</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-medium mb-2">8.1 Kündigung durch den Nutzer</h3>
              <p className="text-sm text-gray-600">
                Der Nutzer kann sein Konto jederzeit ohne Angabe von Gründen löschen. 
                Eine Kündigung per E-Mail an [IHRE E-MAIL] ist ausreichend.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">8.2 Kündigung durch uns</h3>
              <p className="text-sm text-gray-600">
                Wir können das Nutzungsverhältnis mit einer Frist von 30 Tagen kündigen. 
                Bei schwerwiegenden Verstößen gegen diese AGB können wir fristlos kündigen.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">8.3 Löschung von Daten</h3>
              <p className="text-sm text-gray-600">
                Nach Beendigung der Nutzung werden die Daten entsprechend den gesetzlichen 
                Aufbewahrungsfristen gelöscht.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">§ 9 Änderungen der AGB</h2>
          <p className="text-sm text-gray-600">
            Wir behalten uns vor, diese AGB zu ändern. Änderungen werden den Nutzern 
            mindestens 30 Tage vor Inkrafttreten per E-Mail mitgeteilt. 
            Widerspricht der Nutzer nicht innerhalb von 30 Tagen, gelten die neuen AGB als angenommen.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">§ 10 Anwendbares Recht und Gerichtsstand</h2>
          <p className="text-sm text-gray-600 mb-4">
            Es gilt österreichisches Recht unter Ausschluss der UN-Kaufrechtskonvention. 
            Gerichtsstand für alle Streitigkeiten ist [IHR GERICHTSSTAND], Österreich.
          </p>
          <p className="text-sm text-gray-600">
            Verbraucher können auch an ihrem Wohnsitzgericht klagen.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">§ 11 Salvatorische Klausel</h2>
          <p className="text-sm text-gray-600">
            Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, 
            bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">§ 12 Kontakt</h2>
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-sm mb-2">
              Bei Fragen zu diesen AGB kontaktieren Sie uns:
            </p>
            <p className="font-medium">
              [IHR FIRMENNAME]<br/>
              [IHRE ADRESSE]<br/>
              [PLZ] [ORT], Österreich<br/>
              E-Mail: [IHRE E-MAIL]<br/>
              Telefon: [IHRE TELEFONNUMMER]
            </p>
          </div>
        </div>

        <div className="border-t pt-6">
          <p className="text-xs text-gray-500">
            Stand dieser AGB: {new Date().toLocaleDateString('de-AT')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AGB;