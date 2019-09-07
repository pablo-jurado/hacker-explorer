import L from "../leaflet/leaflet";

export function setMapView(lat, lon, zoom = 0) {
    appState.map.setView([lat, lon], zoom);
}

export function buildMap(lat, lon) {
    appState.map = L.map('mapid');

    setMapView(lat, lon, 5);

    L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${process.env.MAPBOX_TOKEN}`, {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: `mapbox.${appState.theme}`,
        accessToken: process.env.MAPBOX_TOKEN
    }).addTo(appState.map);

    appState.map.zoomControl.setPosition('bottomright');
}

export function addMarker(cityName, lat, lon, usersCount) {
    var marker = L.marker([lat, lon]).addTo(appState.map);
    marker.bindPopup(`
        <strong>${cityName}</strong>
        <br>
        <p>Has ${usersCount} hackers</p>`
    ).openPopup();
    return marker;
}