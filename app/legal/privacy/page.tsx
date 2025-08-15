export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>1. Datenschutz auf einen Blick</h2>
        <h3>Allgemeine Hinweise</h3>
        <p>
          Diese Website sammelt keine personenbezogenen Daten. Wir verwenden keine Cookies, keine Tracking-Skripte und
          keine Analysedienste. Alle Einstellungen und die Spielehistorie werden ausschließlich lokal in Ihrem Browser
          gespeichert.
        </p>

        <h2>2. Lokale Datenspeicherung</h2>
        <p>Diese Website nutzt die localStorage-Funktion Ihres Browsers, um folgende Daten lokal zu speichern:</p>
        <ul>
          <li>Ihre Filtereinstellungen (Plattform, Genre, Preis)</li>
          <li>Die letzten 5 Spielevorschläge (Historie)</li>
          <li>Theme-Einstellungen (Hell-/Dunkelmodus)</li>
        </ul>
        <p>Diese Daten verlassen niemals Ihren Browser und werden nicht an uns oder Dritte übertragen.</p>

        <h2>3. Externe APIs</h2>
        <p>
          Diese Website nutzt externe Gaming-APIs (RAWG, Steam, Epic Games) um Spieleinformationen abzurufen. Diese
          Anfragen werden über unseren Server geleitet, um Ihre IP-Adresse zu schützen. Wir speichern keine Logs dieser
          Anfragen.
        </p>

        <h2>4. Ihre Rechte</h2>
        <p>
          Da wir keine personenbezogenen Daten sammeln, gibt es auch keine zu löschen oder zu korrigieren. Sie können
          jederzeit Ihre lokalen Daten löschen, indem Sie den Browser-Cache leeren.
        </p>
      </div>
    </div>
  )
}
