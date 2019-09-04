
let appState = {
    theme: "light",
    location: {
        name: null,
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
        id: styles[0],
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

function cleanupUsers() {
    appState.users = [];
    const aside = document.getElementById("aside-users");
    aside.innerHTML = "";
}

async function handleLocationForm(e) {
    e.preventDefault();
    //TODO: resetState
    cleanupUsers();
    appState.page = 0;
    
    //TODO: resetState
    if (appState.location.marker) {
        appState.location.marker.remove();
    }

    const target = e.target;
    const searchString = encodeURI(target[0].value);
    let city = null;
    
    const usersData = await getUsersByLocation(searchString);
    const usersCount = usersData.total_count;

    const locationData = await getCoordinates(searchString);

    if (locationData.components._type === "country") {
        city = locationData.components.country;
    } else if (locationData.components._type === "city") {
        city = locationData.components.city;
    }

    const {lat, lng} = locationData.geometry;

    setMapView(lat, lng, 6)
    appState.location.name = city;
    appState.location.marker = addMarker(city, lat, lng, usersCount);
    appState.users.push(usersData.items);
    renderUsers();
}

function addEvents() {
    const form = document.getElementById("location-form");
    const aside = document.getElementById("aside-users");

    form.addEventListener("submit", handleLocationForm);
    aside.addEventListener("scroll", handleAsideScroll);
}

// function updateUsers

async function init () {
    addEvents();

    const location = await getLocation();
    const {city, lat, lon} = location;
    appState.location.name = city;
    buildMap(lat, lon);
    const userData = await getUsersByLocation(city);
    appState.users.push(userData.items);
    appState.location.userCount = userData.total_count;
    appState.location.marker = addMarker(city, lat, lon, appState.location.userCount);
    renderUsers();
}

init();