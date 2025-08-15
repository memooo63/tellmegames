export default function ImprintPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Impressum</h1>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>Angaben gemäß § 5 TMG</h2>
        <p>
          Mehmet Özgüler
          <br />
          Koppoldstraße 1
          <br />
          86551 Aichach
          <br />
          Deutschland
        </p>

        <h2>Kontakt</h2>
        <p>
          E-Mail:admin@avatarnil.dev
          <br />
          Discord: _xnil
        </p>

        <h2>Haftungsausschluss</h2>
        <h3>Haftung für Inhalte</h3>
        <p>
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
          Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der
          Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
          forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>

        <h3>Markenhinweis</h3>
        <p>
          Diese Website steht in keiner Verbindung zu Steam, Xbox, PlayStation, Epic Games, Nintendo oder anderen
          genannten Marken. Alle genannten Marken- und Produktnamen sind Eigentum ihrer jeweiligen Inhaber und werden
          ausschließlich zu beschreibenden Zwecken verwendet.
        </p>
      </div>
    </div>
  )
}
