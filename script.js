// Karte - Initialisierung

const map = L.map('map').setView([20, 0], 2);

// Klickaktionen auf der gesamten Karte verhindern
L.DomEvent.disableClickPropagation(map._container);


// OpenStreetMap-Platten (Tiles) hinzufügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Icon für Marker
const customIcon = L.icon({
    iconUrl: 'assets/custom-marker.jpg', // Pfad zu deinem benutzerdefinierten Bild
    iconSize: [32, 32], // Größe des Icons
    iconAnchor: [16, 32], // Position des Ankers
    popupAnchor: [0, -32] // Position des Popups relativ zum Marker
});

// Markers-Array, um alle Marker zu speichern und mit Orten zu verknüpfen
const markers = [];
const placesList = document.getElementById('places-list');

// Länderübersetzungen auf Kroatisch (nur Beispiele)
const countryTranslations = {
    "Germany": "Njemačka",
    "France": "Francuska",
    "Italy": "Italija",
    "United States": "Sjedinjene Američke Države",
    "Spain": "Španjolska",
    "Croatia": "Hrvatska",
    "Unknown country": "Nepoznata država"
};

// Marker hinzufügen beim Klicken auf die Karte
map.on('click', async function (e) {
    L.DomEvent.preventDefault(e.originalEvent);
        const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Marker erstellen
    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

    // Aktuelles Zeitstempel
    const timestamp = new Date().toLocaleString();

    // Landname von der API abrufen
    const country = await getCountryName(lat, lng);
    const translatedCountry = countryTranslations[country] || country; // Übersetzen oder den Originalnamen beibehalten

    // Speichern der Daten im LocalStorage
    savePlace(translatedCountry, timestamp, lat, lng, marker);

    // Popup mit den Markerdetails
    marker.bindPopup(`Država: ${translatedCountry} (${country}) <br> Vrijeme: ${timestamp}`).openPopup();
});

// Funktion, um den Ländernamen von OpenStreetMap zu holen
async function getCountryName(lat, lng) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=hr`
        );
        const data = await response.json();
        return data.address.country || 'Nepoznata država';
    } catch (error) {
        console.error('Greška pri dohvaćanju države:', error);
        return 'Nepoznata država';
    }
}

// Funktion, um einen Ort dynamisch zur Liste hinzuzufügen
function addPlaceToList(place) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <b>Država:</b> ${place.country} <br>
        <b>Dodano:</b> ${place.timestamp} <br>
        <label>Kada si bila ovdje?</label>
        <input type="text" value="${place.visitedDate}" placeholder="npr. srpanj 2023">
        <button onclick="deletePlace('${place.country}', '${place.timestamp}')">Izbriši</button>
    `;
    placesList.appendChild(listItem);
}

// Speichern der besuchten Orte im LocalStorage und zur Liste hinzufügen
function savePlace(country, timestamp, lat, lng, marker) {
    const visitedDate = prompt("Kada si bila ovdje medo?"); // Benutzer gibt das Datum ein
    let places = JSON.parse(localStorage.getItem('places')) || [];
    const newPlace = { country, timestamp, visitedDate, latitude: lat, longitude: lng };
    places.push(newPlace);
    localStorage.setItem('places', JSON.stringify(places));

    // Marker mit dem Ort verknüpfen und speichern
    markers.push({ marker, timestamp });

    // Direkt zur Liste hinzufügen
    addPlaceToList(newPlace);
}

// Laden der gespeicherten Orte und Hinzufügen der Marker
function loadPlaces() {
    let places = JSON.parse(localStorage.getItem('places')) || [];
    placesList.innerHTML = ''; // Liste leeren, um Duplikate zu vermeiden

    places.forEach(place => {
        // Marker auf der Karte hinzufügen
        const marker = L.marker([place.latitude, place.longitude], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
            <b>Država:</b> ${place.country} <br>
            <b>Dodano:</b> ${place.timestamp} <br>
            <label>Kada si bila ovdje?</label>
            <input type="text" value="${place.visitedDate}" placeholder="npr. srpanj 2023">
        `);

        // Marker speichern
        markers.push({ marker, timestamp: place.timestamp });

        // Eintrag in die Liste hinzufügen
        addPlaceToList(place);
    });
}

// Löschen eines gespeicherten Ortes und zugehörigen Markers
function deletePlace(country, timestamp) {
    if (confirm(`Da li ste sigurni da želite izbrisati ${country}?`)) {
        // Ort aus dem LocalStorage entfernen
        let places = JSON.parse(localStorage.getItem('places')) || [];
        places = places.filter(place => place.country !== country || place.timestamp !== timestamp);
        localStorage.setItem('places', JSON.stringify(places));

        // Marker von der Karte entfernen
        const markerData = markers.find(m => m.timestamp === timestamp);
        if (markerData) {
            map.removeLayer(markerData.marker);
            markers.splice(markers.indexOf(markerData), 1);
        }

        // Liste neu laden
        loadPlaces();
    }
}

// Beim Laden der Seite die gespeicherten Orte anzeigen
window.addEventListener('load', () => {
    // Migration für alte Daten ohne Lat/Lng
    let places = JSON.parse(localStorage.getItem('places')) || [];
    places = places.map(place => ({
        ...place,
        latitude: place.latitude || 0, // Standardwerte setzen
        longitude: place.longitude || 0
    }));
    localStorage.setItem('places', JSON.stringify(places));
    loadPlaces();
});
