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
        sourceLabel: "Dein lokaler Feed",
        /* Many RSS providers block browser requests. See docs/CONFIGURATION.md. */
        feedUrl: "",
        corsProxyUrl: "",
        maxItems: 6,
        refreshMinutes: 20
    },
    radio: {
        autoplay: false,
        stations: [
            { name: "Beispielradio", detail: "Bitte Stream-URL eintragen", streamUrl: "" }
        ]
    },
    apps: [
        { name: "YouTube", aliases: ["YouTube"], appId: "", symbol: "▶", accent: "#e95454" },
        { name: "Netflix", aliases: ["Netflix"], appId: "", symbol: "N", accent: "#c83e49" },
        { name: "Eigene App", aliases: [], appId: "", symbol: "★", accent: "#7a91dc" }
    ],
    sources: [
        { name: "HDMI 1", number: 1, symbol: "HDMI", accent: "#f2c46d" },
        { name: "HDMI 2", number: 2, symbol: "HDMI", accent: "#80d5c2" }
    ],
    gallery: {
        title: "Willkommen",
        subtitle: "Eigene Bilder unter assets/gallery/ ablegen und hier eintragen.",
        intervalSeconds: 12,
        images: []
    }
};

