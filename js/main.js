(function () {
    "use strict";

    var BASE_WIDTH = 1920;
    var BASE_HEIGHT = 1080;
    var config = window.DASHBOARD_CONFIG || {};
    var apps = config.apps || [];
    var sources = config.sources || [];
    var stations = (config.radio && config.radio.stations) || [];
    var radioIndex = 0;
    var toastTimer = null;
    var sourceVisible = false;
    var galleryIndex = 0;
    var galleryTimer = null;

    function byId(id) { return document.getElementById(id); }
    function list(value) { return Object.prototype.toString.call(value) === "[object Array]" ? value : []; }
    function string(value, fallback) { return value === undefined || value === null || value === "" ? fallback : String(value); }
    function applyScale() {
        var scale = Math.min(window.innerWidth / BASE_WIDTH, window.innerHeight / BASE_HEIGHT);
        document.documentElement.style.fontSize = Math.max(9, 16 * scale).toFixed(3) + "px";
    }
    function showToast(message, isError) {
        var toast = byId("toast");
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.className = "toast is-visible" + (isError ? " is-error" : "");
        toastTimer = window.setTimeout(function () { toast.className = "toast"; }, 4800);
    }
    function errorText(error) {
        if (!error) { return "Unbekannter Plattformfehler."; }
        if (error.name === "NotFoundError") { return "Nicht auf diesem TV gefunden."; }
        if (error.name === "SecurityError") { return "Der TV verweigert diesen Zugriff."; }
        return error.name + (error.message ? ": " + error.message : "");
    }
    function request(url, responseType, success, failure) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.timeout = 12000;
        xhr.onload = function () {
            if (xhr.status < 200 || xhr.status >= 300) { failure(); return; }
            success(xhr.responseText);
        };
        xhr.onerror = failure;
        xhr.ontimeout = failure;
        try { xhr.send(); } catch (error) { failure(); }
    }
    function requestJson(url, success, failure) {
        request(url, "json", function (text) {
            try { success(JSON.parse(text)); } catch (error) { failure(); }
        }, failure);
    }

    function applyBrand() {
        var brand = config.business || {}, theme = config.theme || {};
        var root = document.documentElement;
        document.body.setAttribute("data-theme", string(theme.preset, "golden-night"));
        document.body.setAttribute("data-icon-style", string(theme.tileIconStyle, "gold"));
        root.style.setProperty("--accent", string(brand.accent, "#80d5c2"));
        root.style.setProperty("--accent-warm", string(brand.accentWarm, "#f2c46d"));
        byId("business-name").textContent = string(brand.name, "Service Dashboard");
        byId("brand-subtitle").textContent = string(brand.subtitle, "SERVICE DASHBOARD").toUpperCase();
        byId("weather-location").textContent = string(brand.locationLabel, "–").toUpperCase();
        byId("footer-status").textContent = string(brand.name, "Service Dashboard") + " · bereit";
    }
    function localeDate(options) {
        var brand = config.business || {};
        try { options.timeZone = brand.timezone || "Europe/Berlin"; return new Date().toLocaleDateString("de-DE", options); }
        catch (error) { delete options.timeZone; return new Date().toLocaleDateString("de-DE", options); }
    }
    function updateClock() {
        var brand = config.business || {}, options = { hour: "2-digit", minute: "2-digit" };
        try { options.timeZone = brand.timezone || "Europe/Berlin"; byId("clock").textContent = new Date().toLocaleTimeString("de-DE", options); }
        catch (error) { delete options.timeZone; byId("clock").textContent = new Date().toLocaleTimeString("de-DE", options); }
        byId("clock-date").textContent = localeDate({ weekday: "long", day: "2-digit", month: "long" });
    }

    function weatherIcon(code) {
        if (code === 0) { return "☀"; }
        if (code === 1 || code === 2) { return "⛅"; }
        if (code === 3 || code === 45 || code === 48) { return "☁"; }
        if (code >= 71 && code <= 77) { return "❄"; }
        if (code >= 80 || code === 51 || code === 53 || code === 55 || code === 56 || code === 57 || (code >= 61 && code <= 67)) { return "☂"; }
        if (code >= 95) { return "ϟ"; }
        return "☁";
    }
    function weatherText(code) {
        if (code === 0) { return "Klar"; }
        if (code === 1 || code === 2) { return "Heiter"; }
        if (code === 3) { return "Bewölkt"; }
        if (code === 45 || code === 48) { return "Nebel"; }
        if (code >= 71 && code <= 77) { return "Schnee"; }
        if (code >= 80 || (code >= 51 && code <= 67)) { return "Regen"; }
        if (code >= 95) { return "Gewitter"; }
        return "Wetter";
    }
    function loadWeather() {
        var weather = config.weather || {}, latitude = Number(weather.latitude), longitude = Number(weather.longitude), url;
        if (isNaN(latitude) || isNaN(longitude)) { byId("weather-description").textContent = "Bitte konfigurieren"; return; }
        url = "https://api.open-meteo.com/v1/forecast?latitude=" + encodeURIComponent(latitude) + "&longitude=" + encodeURIComponent(longitude) + "&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto";
        requestJson(url, function (data) {
            var current = data.current || {}, code = Number(current.weather_code);
            byId("weather-icon").textContent = weatherIcon(code);
            byId("weather-temp").textContent = Math.round(Number(current.temperature_2m)) + "°";
            byId("weather-description").textContent = weatherText(code);
            byId("weather-detail").textContent = "Wind " + Math.round(Number(current.wind_speed_10m || 0)) + " km/h";
        }, function () {
            byId("weather-icon").textContent = "☁";
            byId("weather-temp").textContent = "–°";
            byId("weather-description").textContent = "nicht verfügbar";
            byId("weather-detail").textContent = "Prüfe Internet und Freigaben";
        });
    }

    function loadNews() {
        var news = config.news || {}, feed = string(news.feedUrl, ""), proxy = string(news.corsProxyUrl, ""), url, maxItems = Number(news.maxItems) || 6;
        var target = byId("news-list");
        byId("news-title").textContent = string(news.title, "AKTUELLE NEWS");
        byId("news-source").textContent = string(news.sourceLabel, "RSS-Feed");
        if (!feed) {
            target.innerHTML = "";
            list(news.demoItems).slice(0, maxItems).forEach(function (headline) { var item = document.createElement("li"); item.textContent = headline; target.appendChild(item); });
            if (!target.children.length) { target.innerHTML = "<li>RSS-Feed in js/dashboard.config.js eintragen.</li>"; }
            return;
        }
        url = proxy ? proxy + encodeURIComponent(feed) : feed;
        request(url, "text", function (xml) {
            var documentXml = new DOMParser().parseFromString(xml, "text/xml");
            var entries = documentXml.querySelectorAll("item > title, entry > title"), index, item;
            target.innerHTML = "";
            for (index = 0; index < entries.length && index < maxItems; index += 1) {
                item = document.createElement("li");
                item.textContent = entries[index].textContent.replace(/^\s+|\s+$/g, "");
                target.appendChild(item);
            }
            if (!target.children.length) { target.innerHTML = "<li>Der Feed enthält keine lesbaren Überschriften.</li>"; }
        }, function () { target.innerHTML = "<li>News nicht erreichbar – CORS/URL in der Konfiguration prüfen.</li>"; });
    }

    function shuffle(items) {
        var index, swapIndex, temp;
        for (index = items.length - 1; index > 0; index -= 1) {
            swapIndex = Math.floor(Math.random() * (index + 1));
            temp = items[index]; items[index] = items[swapIndex]; items[swapIndex] = temp;
        }
    }
    function renderGallery() {
        var gallery = config.gallery || {}, images = list(gallery.images).slice(0), container = byId("gallery-images"), index, image;
        byId("gallery-title").textContent = string(gallery.title, "Willkommen");
        byId("gallery-subtitle").textContent = string(gallery.subtitle, "Eigene Galeriebilder konfigurieren.");
        window.clearInterval(galleryTimer);
        if (!images.length) { container.innerHTML = ""; return; }
        shuffle(images);
        function show() {
            container.innerHTML = "";
            for (index = 0; index < Math.min(3, images.length); index += 1) {
                image = document.createElement("img");
                image.src = images[(galleryIndex + index) % images.length];
                image.alt = "Galeriebild";
                container.appendChild(image);
            }
            galleryIndex = (galleryIndex + 3) % images.length;
            if (galleryIndex === 0) { shuffle(images); }
        }
        show();
        galleryTimer = window.setInterval(show, Math.max(5, Number(gallery.intervalSeconds) || 12) * 1000);
    }

    function radioElements() { return { audio: byId("radio-audio"), card: byId("radio-card"), state: byId("radio-state"), name: byId("radio-name"), detail: byId("radio-detail"), toggle: byId("radio-toggle") }; }
    function currentStation() { return stations[radioIndex] || null; }
    function renderRadio(state) {
        var elements = radioElements(), station = currentStation(), live = !elements.audio.paused && elements.audio.src;
        elements.card.classList.toggle("is-playing", Boolean(live));
        elements.state.textContent = state || (live ? "LIVE" : "BEREIT");
        elements.name.textContent = station ? string(station.name, "Unbenannter Sender") : "Kein Sender konfiguriert";
        elements.detail.textContent = station ? string(station.detail, "Live") : "Stream-URL eintragen";
        elements.toggle.textContent = live ? "Ⅱ" : "▶";
    }
    function playRadio() {
        var station = currentStation(), elements = radioElements(), result;
        if (!station || !station.streamUrl) { showToast("Bitte mindestens einen Radio-Stream konfigurieren.", true); return; }
        if (elements.audio.src !== station.streamUrl) { elements.audio.src = station.streamUrl; elements.audio.load(); }
        renderRadio("LÄDT …");
        try {
            result = elements.audio.play();
            if (result && typeof result.catch === "function") { result.catch(function () { renderRadio("STREAM FEHLER"); showToast("Der Radiosender konnte nicht gestartet werden.", true); }); }
        } catch (error) { renderRadio("STREAM FEHLER"); showToast("Der Radiosender konnte nicht gestartet werden.", true); }
    }
    function toggleRadio() { var audio = radioElements().audio; if (audio.paused) { playRadio(); } else { audio.pause(); renderRadio("PAUSE"); } }
    function changeStation(direction) {
        var audio = radioElements().audio, wasPlaying = !audio.paused;
        if (!stations.length) { return; }
        radioIndex = (radioIndex + direction + stations.length) % stations.length;
        audio.pause(); audio.removeAttribute("src"); audio.load(); renderRadio("BEREIT");
        if (wasPlaying) { playRadio(); }
    }

    function normalise(value) { return String(value || "").toLocaleLowerCase("de-DE").replace(/\s+/g, " ").trim(); }
    function tile(group, item, index) {
        var button = document.createElement("button"), symbol = document.createElement("span"), copy = document.createElement("span"), name = document.createElement("span"), detail = document.createElement("span");
        button.type = "button"; button.className = "tile"; button.setAttribute("data-focusable", "true"); button.setAttribute("data-row", group === "apps" ? "1" : "2"); button.setAttribute("data-column", String(index)); button.style.setProperty("--tile-accent", string(item.accent, "#80d5c2"));
        symbol.className = "tile__symbol"; symbol.textContent = string(item.symbol, group === "apps" ? "●" : "HDMI");
        copy.className = "tile__copy"; name.className = "tile__name"; detail.className = "tile__detail"; name.textContent = string(item.name, "Unbenannt"); detail.textContent = group === "apps" ? "Wird geprüft …" : "Nicht verbunden";
        copy.appendChild(name); copy.appendChild(detail); button.appendChild(symbol); button.appendChild(copy);
        button.addEventListener("click", function () { if (group === "apps") { launchApp(item, detail); } else { switchSource(item); } });
        return button;
    }
    function renderApps() {
        var container = byId("apps-grid"), index, element;
        container.innerHTML = "";
        for (index = 0; index < apps.length; index += 1) { element = tile("apps", apps[index], index); container.appendChild(element); apps[index].element = element; }
    }
    function discoverApps() {
        if (!window.tizen || !tizen.application || typeof tizen.application.getAppsInfo !== "function") { return; }
        try {
            tizen.application.getAppsInfo(function (installed) {
                apps.forEach(function (app) {
                    var aliases = list(app.aliases).concat([app.name]).map(normalise), match = installed.filter(function (candidate) { return aliases.indexOf(normalise(candidate.name)) !== -1; })[0], detail;
                    if (match && !app.appId) { app.resolvedAppId = match.id; }
                    detail = app.element && app.element.querySelector(".tile__detail");
                    if (detail) { detail.textContent = app.appId || app.resolvedAppId ? "Öffnen" : "Nicht installiert"; detail.classList.toggle("tile__detail--ready", Boolean(app.appId || app.resolvedAppId)); }
                });
            }, function () { showToast("Installierte Apps konnten nicht gelesen werden.", true); });
        } catch (error) { showToast("Installierte Apps konnten nicht gelesen werden.", true); }
    }
    function launchApp(app) {
        var appId = app.appId || app.resolvedAppId;
        if (!appId) { showToast(app.name + " ist auf diesem TV nicht installiert oder noch nicht konfiguriert.", true); return; }
        if (!window.tizen || !tizen.application || typeof tizen.application.launch !== "function") { showToast("Tizen Application API ist nicht verfügbar.", true); return; }
        try { tizen.application.launch(appId, function () { showToast(app.name + " wird gestartet."); }, function (error) { showToast(app.name + " konnte nicht gestartet werden: " + errorText(error), true); }); }
        catch (error) { showToast(app.name + " konnte nicht gestartet werden: " + errorText(error), true); }
    }
    function renderSources(connected) {
        var container = byId("sources-grid"), section = byId("sources-section"), index, source, item, element;
        container.innerHTML = "";
        for (index = 0; index < sources.length; index += 1) {
            source = sources[index];
            item = connected.filter(function (candidate) { return Number(candidate.number) === Number(source.number); })[0];
            if (!item) { continue; }
            source.connected = item; element = tile("sources", source, container.children.length); element.querySelector(".tile__detail").textContent = "HDMI " + source.number; element.querySelector(".tile__detail").classList.add("tile__detail--ready"); container.appendChild(element);
        }
        section.hidden = !container.children.length;
    }
    function refreshSources() {
        if (!window.tizen || !tizen.systeminfo || typeof tizen.systeminfo.getPropertyValue !== "function") { byId("sources-section").hidden = true; return; }
        try { tizen.systeminfo.getPropertyValue("VIDEOSOURCE", function (data) { renderSources((data.connected || []).filter(function (item) { return item.type === "HDMI"; })); }, function () { renderSources([]); }); }
        catch (error) { renderSources([]); }
    }
    function switchSource(source) {
        if (!source.connected || !window.tizen || !tizen.tvwindow) { showToast("Dieser HDMI-Eingang ist nicht verfügbar.", true); refreshSources(); return; }
        try { tizen.tvwindow.setSource(source.connected, function () { tizen.tvwindow.show(function () { sourceVisible = true; showToast(source.name + " ist aktiv."); }, function (error) { showToast("HDMI-Bild konnte nicht gezeigt werden: " + errorText(error), true); }, ["0px", "0px", "100%", "100%"], "MAIN"); }, function (error) { showToast("HDMI konnte nicht gewählt werden: " + errorText(error), true); }, "MAIN"); }
        catch (error) { showToast("HDMI-Umschaltung fehlgeschlagen: " + errorText(error), true); }
    }
    function hideSource() { try { tizen.tvwindow.hide(function () { sourceVisible = false; focusInitial(); }, function () { sourceVisible = false; }, "MAIN"); } catch (error) { sourceVisible = false; } }

    function focusables() { return Array.prototype.slice.call(document.querySelectorAll("[data-focusable='true']")); }
    function prepareRadioFocus() {
        [byId("radio-prev"), byId("radio-toggle"), byId("radio-next")].forEach(function (element, index) { element.setAttribute("data-focusable", "true"); element.setAttribute("data-row", "0"); element.setAttribute("data-column", String(index)); });
    }
    function focusInitial() { var first = focusables()[0]; if (first) { first.focus(); } }
    function moveFocus(rowDelta, columnDelta) {
        var active = document.activeElement, currentRow = Number(active.getAttribute("data-row")), currentColumn = Number(active.getAttribute("data-column")), all = focusables(), wantedRow = currentRow + rowDelta, wantedColumn = currentColumn + columnDelta, candidates, best;
        if (!active || active.getAttribute("data-focusable") !== "true") { focusInitial(); return; }
        candidates = all.filter(function (item) { return Number(item.getAttribute("data-row")) === wantedRow; });
        if (!candidates.length && rowDelta) { return; }
        if (!rowDelta) { candidates = all.filter(function (item) { return Number(item.getAttribute("data-row")) === currentRow; }); }
        best = candidates.sort(function (left, right) { return Math.abs(Number(left.getAttribute("data-column")) - wantedColumn) - Math.abs(Number(right.getAttribute("data-column")) - wantedColumn); })[0];
        if (best) { best.focus(); }
    }
    function exitDashboard() { try { tizen.application.getCurrentApplication().exit(); } catch (error) { showToast("Dashboard kann nur auf einem Tizen-TV geschlossen werden."); } }
    function registerKeys() { try { if (window.tizen && tizen.tvinputdevice && tizen.tvinputdevice.registerKeyBatch) { tizen.tvinputdevice.registerKeyBatch(["MediaPlay", "MediaPause", "MediaPlayPause", "MediaTrackNext", "MediaTrackPrevious"]); } } catch (error) { } }
    function handleKey(event) {
        var key = event.key, code = event.keyCode || event.which;
        if (key === "MediaPlay" || key === "MediaPlayPause" || code === 415) { toggleRadio(); event.preventDefault(); return; }
        if (key === "MediaPause" || code === 19) { if (!radioElements().audio.paused) { toggleRadio(); } event.preventDefault(); return; }
        if (key === "MediaTrackNext" || code === 425) { changeStation(1); event.preventDefault(); return; }
        if (key === "MediaTrackPrevious" || code === 424) { changeStation(-1); event.preventDefault(); return; }
        if (key === "ArrowLeft" || code === 37) { moveFocus(0, -1); event.preventDefault(); return; }
        if (key === "ArrowRight" || code === 39) { moveFocus(0, 1); event.preventDefault(); return; }
        if (key === "ArrowUp" || code === 38) { moveFocus(-1, 0); event.preventDefault(); return; }
        if (key === "ArrowDown" || code === 40) { moveFocus(1, 0); event.preventDefault(); return; }
        if (key === "Back" || key === "BrowserBack" || code === 10009) { if (sourceVisible) { hideSource(); } else { exitDashboard(); } event.preventDefault(); }
    }
    function wireRadio() {
        byId("radio-prev").addEventListener("click", function () { changeStation(-1); });
        byId("radio-next").addEventListener("click", function () { changeStation(1); });
        byId("radio-toggle").addEventListener("click", toggleRadio);
        radioElements().audio.addEventListener("playing", function () { renderRadio("LIVE"); });
        radioElements().audio.addEventListener("pause", function () { renderRadio("PAUSE"); });
        radioElements().audio.addEventListener("error", function () { renderRadio("STREAM FEHLER"); });
    }
    function init() {
        applyBrand(); applyScale(); updateClock(); loadWeather(); loadNews(); renderGallery(); renderApps(); prepareRadioFocus(); renderRadio("BEREIT"); wireRadio(); discoverApps(); refreshSources(); registerKeys(); focusInitial();
        window.setInterval(updateClock, 1000);
        window.setInterval(loadWeather, Math.max(10, Number((config.weather || {}).refreshMinutes) || 30) * 60000);
        window.setInterval(loadNews, Math.max(5, Number((config.news || {}).refreshMinutes) || 20) * 60000);
        window.setInterval(refreshSources, 30000);
        window.addEventListener("resize", applyScale);
        document.addEventListener("keydown", handleKey, true);
        if (config.radio && config.radio.autoplay) { window.setTimeout(playRadio, 1200); }
    }
    init();
}());

