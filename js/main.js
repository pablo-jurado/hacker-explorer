import { renderUsers, renderModal } from "./render";
import { buildMap, setMapView, addMarker } from "./map";
import { getLocationName } from "./utils";

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

window.appState = appState;

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

async function handleUserClick(url) {
    const response = await myFetch(url);
    renderModal(response);
}

async function getLocation() {
    const url = 'http://ip-api.com/json';
    const location = await myFetch(url);
    return location;
}

async function getCoordinates(place) {
    let url = `https://api.opencagedata.com/geocode/v1/json?q=${place}&key=${process.env.GEO_LOCATION_KEY}`;
    const data = await myFetch(url);
    return data.results[0];
}

async function getUsersByLocation(city) {
    appState.page++;
    const url = `https://api.github.com/search/users?q=location:${city}&page=${appState.page}`
    const users = await myFetch(url);
    return users;
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
        
        app.classList.toggle("dark");

        darkBtn.style.display = "none";
        lightBtn.style.display = "inline-flex";
    } else {
        appState.theme = "light";
        
        app.classList.toggle("dark");
        
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

function closeModal() {
    const wrapper = document.getElementById("modal-wrapper");
    wrapper.innerHTML = "";
}

function addEvents() {
    const form = document.getElementById("location-form");
    const aside = document.getElementById("aside-users");
    const darkBtn = document.getElementById("dark-btn");
    const lightBtn = document.getElementById("light-btn");

    window.handleUserClick = handleUserClick;
    window.closeModal = closeModal;

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
