export function isCountry(location) {
    return location.components._type === "country";
}

export function isCity(location) {
    return location.components._type === "city";
}

export function getLocationName(location) {
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
