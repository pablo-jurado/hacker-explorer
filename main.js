$(document).ready(function() {

    let appState = {
        theme: "light",
        current: {
            location: null,
            marker: null,
        },
        search: {
            location: null,
            marker: null
        },
        map: null,
    }

    async function myFetch(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }

    function buildMap(lat, lon) {
        appState.map = L.map('mapid');

        var styles = ["mapbox.light", "mapbox.dark"]

        setMapView(lat, lon, 5);

        L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${MapBoxAccessToken}`, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: styles[1],
            accessToken: MapBoxAccessToken
        }).addTo(appState.map);
    }

    function addMarker(cityName, lat, lon, usersCount) {
        var marker = L.marker([lat, lon]).addTo(appState.map);
        marker.bindPopup(`<b>${cityName}</b><br>Has ${usersCount} hackers`).openPopup();
        return marker;
    }

    async function getLocation() {
        const url = 'http://ip-api.com/json';
        const location = await myFetch(url);
        return location;
    }

    async function getCoordinates(place) {
        let url = `https://api.opencagedata.com/geocode/v1/json?q=${place}&key=${geoLocationKey}`;
        const data = await myFetch(url);
        return data.results[0];
    }

    async function getUsersByLocation(city) {
        const url = `https://api.github.com/search/users?q=location:${city}`
        const users = await myFetch(url);
        return users;

    }

    function setMapView(lat, lon, zoom = 0) {
        appState.map.setView([lat, lon], zoom);
    }

    async function handleLocationForm(e) {
        e.preventDefault();
        if (appState.search.marker) {
            appState.search.marker.remove();
        }

        const target = e.target;
        const searchString = encodeURI(target[0].value);
        let city = null;
        
        const users = await getUsersByLocation(searchString);
        const usersCount = users.total_count;

        const locationData = await getCoordinates(searchString);

        if (locationData.components._type === "country") {
            city = locationData.components.country;
        } else if (locationData.components._type === "city") {
            city = locationData.components.city;
        }

        const {lat, lng} = locationData.geometry;

        setMapView(lat, lng, 6)
        appState.search.marker = addMarker(city, lat, lng, usersCount);;
    }

    function addEvents() {
        let form = document.getElementById("location-form");
        form.addEventListener("submit", handleLocationForm);
    }
    
    async function init () {
        addEvents();

        const location = await getLocation();
        appState.current.location = location;
        const {city, lat, lon} = location;
        buildMap(lat, lon);
        const users = await getUsersByLocation(city);
        appState.current.marker = addMarker(city, lat, lon, users.total_count);;
    }

    init();
});