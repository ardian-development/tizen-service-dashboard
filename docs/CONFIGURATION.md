# Konfiguration

Alle sichtbaren Inhalte werden in [`js/dashboard.config.js`](../js/dashboard.config.js) eingestellt. Die Datei ist absichtlich Teil des Projekts, enthält aber keine geheimen Daten.

## Branding und Wetter

```js
business: {
  name: "Salon Beispiel",
  subtitle: "Hair · Beauty · Wellness",
  locationLabel: "Köln",
  timezone: "Europe/Berlin",
  accent: "#80d5c2",
  accentWarm: "#f2c46d"
},
weather: {
  latitude: 50.9375,
  longitude: 6.9603,
  refreshMinutes: 30
}
```

Das Wetter nutzt Open-Meteo ohne API-Key. Die Koordinaten können beispielsweise mit OpenStreetMap oder einer Karten-App ermittelt werden.

## RSS-Nachrichten

```js
news: {
  title: "LOKALE NEWS",
  sourceLabel: "Stadtmagazin",
  feedUrl: "https://example.org/rss.xml",
  corsProxyUrl: "",
  maxItems: 6,
  refreshMinutes: 20
}
```

Die App kann nur Feeds laden, die Browser-Zugriffe erlauben. Wenn beim Widget `News nicht erreichbar` erscheint, blockiert der Feed wahrscheinlich Cross-Origin Requests (CORS). Verwende dann einen CORS-fähigen Feed oder einen eigenen, datensparsamen Proxy. Ein Proxy muss die Feed-URL URL-kodiert hinter seinem Basis-Endpunkt erwarten, beispielsweise `https://dein-proxy.example/?url=`.

Speichere keine Zugangsdaten, API-Keys oder privaten Termine in dieser Datei: Der Inhalt eines WGT lässt sich auslesen.

## Radio

```js
radio: {
  autoplay: false,
  stations: [
    { name: "Dein Sender", detail: "Live", streamUrl: "https://example.org/live.mp3" }
  ]
}
```

Verwende direkte, öffentlich erreichbare HTTPS-Audio-Streams. Ein Sender ohne `streamUrl` bleibt als Platzhalter sichtbar. Die Hardware-Tasten Play/Pause sowie Vor/Zurück steuern das Radio, ohne den Fokus auf dem Dashboard zu verschieben.

## Apps

```js
apps: [
  {
    name: "Mediathek",
    aliases: ["Anzeigename auf dem TV"],
    appId: "",
    symbol: "▶",
    accent: "#e95454"
  }
]
```

Ist `appId` leer, sucht das Dashboard über `aliases` und `name` nach einer installierten App. Das ist bequem, aber nicht überall eindeutig. Für einen stabilen Betrieb hinterlege die exakte Tizen-App-ID, sobald du sie auf deinem TV kennst.

App-IDs sind regional, modell- und versionsabhängig. Das Template enthält bewusst keine fremden Logos und keine fremden IDs.

## HDMI-Eingänge

```js
sources: [
  { name: "PlayStation", number: 1, symbol: "PS", accent: "#4699ff" },
  { name: "Nintendo", number: 2, symbol: "SW", accent: "#f1555d" }
]
```

Es werden nur Eingänge angezeigt, die der TV als verbunden meldet. Die Nummern entsprechen der HDMI-Nummer am TV, nicht zwingend der Reihenfolge im Heimkino-Receiver.

## Galerie

Lege eigene Bilder in `assets/gallery/` ab und trage sie ein:

```js
gallery: {
  title: "Unsere Arbeiten",
  subtitle: "Aktuelle Looks aus dem Studio",
  intervalSeconds: 12,
  images: [
    "assets/gallery/look-01.jpg",
    "assets/gallery/look-02.jpg",
    "assets/gallery/look-03.jpg"
  ]
}
```

Die Galerie mischt die Bilder pro Durchlauf und zeigt maximal drei gleichzeitig. Für schlanke WGT-Dateien sind JPEGs mit einer langen Kante von etwa 1280 Pixeln sinnvoll.

