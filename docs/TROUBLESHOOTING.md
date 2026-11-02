# Fehlerbehebung

## `connect failed` oder TV wird nicht gefunden

- TV und PC müssen im selben Netzwerk sein.
- Auf dem TV: Entwickler-Modus aktivieren, die IP des PCs eintragen und den TV neu starten.
- Den korrekten Port verwenden: normalerweise `26101`.
- Test: `C:\tizen-studio\tools\sdb.exe devices`

## App startet nicht

- `config.xml` muss die Package-ID des Samsung-Zertifikats enthalten.
- Die Werte `APP_ID` und `CERTIFICATE_PROFILE` im Terminal bzw. in `build-install.bat` müssen passen.
- Nach Änderungen an `config.xml` immer neu signieren und installieren.

## RSS oder Wetter nicht erreichbar

- TV hat keinen Internetzugang oder DNS-Problem.
- Feed blockiert CORS: siehe [Konfiguration](CONFIGURATION.md#rss-nachrichten).
- Bei eigenen Domains die Sicherheitsrichtlinien überprüfen: `config.xml` und die Content-Security-Policy in `index.html`.

## Radio zeigt `STREAM FEHLER`

- Stream im Browser testen.
- Direkte HTTPS-MP3/AAC-Streams bevorzugen; viele Webseiten-Player liefern keinen verwendbaren Stream.
- Manche Sender erlauben keine TV-/Browser-Wiedergabe. Einen alternativen offiziellen Stream hinterlegen.

## HDMI-Kachel fehlt

Die App zeigt nur Quellen, die Tizen als verbunden meldet. Kabel, Eingang, TV-Einstellung und die `number`-Angabe in der Konfiguration prüfen.

