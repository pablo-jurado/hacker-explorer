$(document).ready(function() {
    function buildMap(location, githubData) {
        let {lat, lon, city} = location;
        let count = githubData.total_count;


        var map = L.map('mapid').setView([lat, lon], 5);
        L.tileLayer(`https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=${accessToken}`, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: 'your.mapbox.access.token'
        }).addTo(map);

        var marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(`<b>${city}</b><br>Has ${count} hackers`).openPopup();

    }

    function getLocation() {
        const url = 'http://ip-api.com/json';
        $.ajax(url).then(function success(response) {
            getGitHubUsers(response);
            },function fail(data, status) {
                console.log('Request failed.  Returned status of', status);
            }
        );
    }

    function getGitHubUsers(location) {
        const url = `https://api.github.com/search/users?q=location:${location.city}`
        $.ajax(url).then(function success(githubData) {
                buildMap(location, githubData);
            },function fail(data, status) {
                console.log('Request failed.  Returned status of', status);
            }
        );
    }

    getLocation();
});