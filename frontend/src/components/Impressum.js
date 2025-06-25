import React from 'react';
import { useTranslation } from '../translations/TranslationContext';

const Impressum = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Impressum</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Anbieterkennzeichnung</h2>
          <p className="text-sm text-gray-600 mb-4">
            Gemäß § 5 ECG (E-Commerce-Gesetz) und § 14 UGB (Unternehmensgesetzbuch)
          </p>
          
          <div className="space-y-2">
            <p><strong>Firmenname:</strong> [IHR FIRMENNAME]</p>
            <p><strong>Geschäftsführung:</strong> [IHR NAME]</p>
            <p><strong>Adresse:</strong> [IHRE ADRESSE]</p>
            <p><strong>PLZ/Ort:</strong> [PLZ] [ORT], Österreich</p>
            <p><strong>Telefon:</strong> [IHRE TELEFONNUMMER]</p>
            <p><strong>E-Mail:</strong> [IHRE E-MAIL]</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Unternehmensgegenstand</h2>
          <p>Online-Plattform für den Verkauf und Kauf von Wohnmobilen, Wohnwagen und Campervans</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Aufsichtsbehörde/Gewerbebehörde</h2>
          <p>Bezirkshauptmannschaft [IHR BEZIRK] / Magistrat [IHRE STADT]</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Berufsbezeichnung</h2>
          <p>Gewerbeberechtigung: [GEWERBE] (verliehen in Österreich)</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Rechtsform und Firmenbuchnummer</h2>
          <p><strong>Rechtsform:</strong> [GmbH/Einzelunternehmen/etc.]</p>
          <p><strong>Firmenbuchnummer:</strong> [FN XXXXX x]</p>
          <p><strong>Firmenbuchgericht:</strong> [GERICHT]</p>
          <p><strong>UID-Nummer:</strong> ATU [XXXXXXXX]</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Anwendbare Rechtsvorschriften</h2>
          <p>
            <a 
              href="https://www.ris.bka.gv.at/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Gewerbeordnung (GewO) - Österreichisches Rechtsinformationssystem
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Online-Streitbeilegung (ODR)</h2>
          <p className="mb-2">
            Plattform der EU-Kommission zur Online-Streitbeilegung:
          </p>
          <p>
            <a 
              href="https://ec.europa.eu/consumers/odr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren 
            vor einer Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Urheberrecht</h2>
          <p className="text-sm text-gray-600">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
            dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und 
            jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Haftungsausschluss</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900">Inhalt des Onlineangebotes</h3>
              <p>
                Der Autor übernimmt keinerlei Gewähr für die Aktualität, Korrektheit, Vollständigkeit 
                oder Qualität der bereitgestellten Informationen. Haftungsansprüche gegen den Autor, 
                welche sich auf Schäden materieller oder ideeller Art beziehen, die durch die Nutzung 
                oder Nichtnutzung der dargebotenen Informationen bzw. durch die Nutzung fehlerhafter 
                und unvollständiger Informationen verursacht wurden, sind grundsätzlich ausgeschlossen.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900">Verweise und Links</h3>
              <p>
                Bei direkten oder indirekten Verweisen auf fremde Internetseiten ("Links"), die außerhalb 
                des Verantwortungsbereiches des Autors liegen, würde eine Haftungsverpflichtung ausschließlich 
                in dem Fall in Kraft treten, in dem der Autor von den Inhalten Kenntnis hat und es ihm 
                technisch möglich und zumutbar wäre, die Nutzung im Falle rechtswidriger Inhalte zu verhindern.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <p className="text-xs text-gray-500">
            Letztes Update: {new Date().toLocaleDateString('de-AT')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Impressum;