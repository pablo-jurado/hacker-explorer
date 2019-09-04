import L from "../leaflet/leaflet";
import { MapBoxAccessToken, geoLocationKey } from "./config";

let appState = {
    theme: "light",
    location: {
        name: null,
        lat: null,
        lon: null,
        marker: null,
        userCount: 0,
    },
    users: [],
    page: 0,
    map: null,
}

async function myFetch(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

async function handleAsideScroll(e) {
    const {clientHeight, scrollTop, scrollHeight} = e.target;
    if (clientHeight + scrollTop >= scrollHeight) {
        const userData = await getUsersByLocation(appState.location.name);
        appState.users.push(userData.items);
        renderUsers();
    }
}

function buildUserCard(user) {
    return `
        <div class="box">
            <img class="user-img" src="${user.avatar_url}"/>
            <p>${user.login}</p>
        </div>
    `;
}

function renderUsers() {
    let aside = document.getElementById("aside-users");
    let usersPage = appState.users[appState.page-1];
    let arrUsers = usersPage.map(buildUserCard);

    var div = document.createElement("div");
    div.classList.add("aside-page");
    div.innerHTML = arrUsers.join("");

    aside.appendChild(div); 
}

function buildMap(lat, lon) {
    appState.map = L.map('mapid');

    var styles = ["mapbox.light", "mapbox.dark"]

    setMapView(lat, lon, 5);

    L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${MapBoxAccessToken}`, {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: `mapbox.${appState.theme}`,
        accessToken: MapBoxAccessToken
    }).addTo(appState.map);

    appState.map.zoomControl.setPosition('bottomright');
}

function addMarker(cityName, lat, lon, usersCount) {
    var marker = L.marker([lat, lon]).addTo(appState.map);
    marker.bindPopup(`
        <strong>${cityName}</strong>
        <br>
        <p>Has ${usersCount} hackers</p>`
    ).openPopup();
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
    appState.page++;
    const url = `https://api.github.com/search/users?q=location:${city}&page=${appState.page}`
    const users = await myFetch(url);
    return users;
}

function setMapView(lat, lon, zoom = 0) {
    appState.map.setView([lat, lon], zoom);
}

function cleanupUsersUI() {
    const aside = document.getElementById("aside-users");
    aside.innerHTML = "";
}

function resetState() {
    appState.page = 0;
    appState.users = [];
    if (appState.location.marker) {
        appState.location.marker.remove();
    }
}

function isCountry(location) {
    return location.components._type === "country";
}

function isCity(location) {
    return location.components._type === "city";
}

function getLocationName(location) {
    let locationName = "";

    if (isCountry(location)) {
        locationName = location.components.country;
    } else if (isCity(location)) {
        locationName = location.components.city;
    } else {
        locationName = "Unknown";
    }
    return locationName;
}

async function handleLocationForm(e) {
    e.preventDefault();
    const target = e.target;
    const searchString = encodeURI(target[0].value);

    if (searchString === "") return
    
    resetState();
    cleanupUsersUI();

    const usersData = await getUsersByLocation(searchString);
    saveUsersData(usersData);

    const locationData = await getCoordinates(searchString);
    const locationName = getLocationName(locationData);
    const {lat, lng} = locationData.geometry;

    appState.location.name = locationName;
    appState.location.lat = lat;
    appState.location.lon = lng;

    setMapView(lat, lng, 6);

    appState.location.marker = addMarker(locationName, lat, lng, appState.location.userCount);
    renderUsers();
}

function toggleUITheme() {
    const darkBtn = document.getElementById("dark-btn");
    const lightBtn = document.getElementById("light-btn");
    const app =  document.getElementById("app");
    
    if (appState.theme === "light") {
        appState.theme = "dark";
        
        app.classList.remove("light");
        app.classList.add("dark");

        darkBtn.style.display = "none";
        lightBtn.style.display = "inline-flex";
    } else {
        appState.theme = "light";
        
        app.classList.remove("dark");
        app.classList.add("light");     
        
        lightBtn.style.display = "none";
        darkBtn.style.display = "inline-flex";
    }

    appState.map.remove();    
    buildMap(appState.location.lat, appState.location.lon);

    appState.location.marker = addMarker(
        appState.location.name, 
        appState.location.lat,
        appState.location.lon,
        appState.location.userCount
    );

}

function saveUsersData(usersData) {
    const userCount = usersData.total_count;
    const usersArray = usersData.items;

    appState.users.push(usersArray);
    appState.location.userCount = userCount;
}

function addEvents() {
    const form = document.getElementById("location-form");
    const aside = document.getElementById("aside-users");
    const darkBtn = document.getElementById("dark-btn");
    const lightBtn = document.getElementById("light-btn");

    form.addEventListener("submit", handleLocationForm);
    aside.addEventListener("scroll", handleAsideScroll);
    darkBtn.addEventListener("click", toggleUITheme);
    lightBtn.addEventListener("click", toggleUITheme);
}

async function init () {
    const lightBtn = document.getElementById("light-btn");
    lightBtn.style.display = "none";

    addEvents();

    const location = await getLocation();
    const {city, lat, lon} = location;

    appState.location.name = city;
    appState.location.lat = lat;
    appState.location.lon = lon;

    buildMap(lat, lon);

    const usersData = await getUsersByLocation(city);
    saveUsersData(usersData);

    appState.location.marker = addMarker(city, lat, lon, appState.location.userCount);
    renderUsers();
}

init();

export {
    isCountry,
    isCity,
    getLocationName
}