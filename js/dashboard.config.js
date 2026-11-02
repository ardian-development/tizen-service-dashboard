/*
 * Copy this file unchanged for a first run, then replace the example values.
 * No secrets belong in this file or in a WGT package.
 */
window.DASHBOARD_CONFIG = {
    theme: {
        /* "golden-night" is a generic emerald/gold visual preset made entirely with CSS. */
        preset: "golden-night",
        tileIconStyle: "gold"
    },
    business: {
        name: "Studio Beispiel",
        subtitle: "Beauty · Hair · Wellness",
        locationLabel: "München",
        timezone: "Europe/Berlin",
        accent: "#80d5c2",
        accentWarm: "#f2c46d"
    },
    weather: {
        latitude: 48.1372,
        longitude: 11.5756,
        refreshMinutes: 30
    },
    news: {
        title: "AKTUELLE NEWS",
        sourceLabel: "Dein lokaler Feed · Beispiel",
        /* Many RSS providers block browser requests. See docs/CONFIGURATION.md. */
        feedUrl: "",
        corsProxyUrl: "",
        maxItems: 6,
        refreshMinutes: 20,
        demoItems: [
            "Willkommen – diesen Bereich mit einem RSS-Feed verbinden.",
            "Aktuelle Aktionen, Termine oder lokale Meldungen anzeigen.",
            "Ohne Feed bleiben nur diese neutralen Beispielzeilen sichtbar."
        ]
    },
    radio: {
        autoplay: false,
        stations: [
            { name: "Beispielradio", detail: "Bitte Stream-URL eintragen", streamUrl: "" }
        ]
    },
    apps: [
        { name: "Mediathek", aliases: [], appId: "", symbol: "TV", accent: "#e1a852" },
        { name: "Musik", aliases: [], appId: "", symbol: "♫", accent: "#80d5c2" },
        { name: "Eigene App", aliases: [], appId: "", symbol: "★", accent: "#8c9be5" }
    ],
    sources: [
        { name: "HDMI 1", number: 1, symbol: "HDMI", accent: "#f2c46d" },
        { name: "HDMI 2", number: 2, symbol: "HDMI", accent: "#80d5c2" }
    ],
    gallery: {
        title: "Willkommen",
        subtitle: "Eigene Bilder unter assets/gallery/ ablegen und hier eintragen.",
        intervalSeconds: 12,
        images: [
            "assets/demo/hair.svg",
            "assets/demo/beauty.svg",
            "assets/demo/wellness.svg"
        ]
    }
};

