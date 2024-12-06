// Karte - Initialisierung
const map = L.map('map').setView([20, 0], 2);

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

// Markers-Array, um alle Marker zu speichern
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
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Marker erstellen
    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    markers.push(marker);

    // Aktuelles Zeitstempel
    const timestamp = new Date().toLocaleString();

    // Landname von der API abrufen
    const country = await getCountryName(lat, lng);
    const translatedCountry = countryTranslations[country] || country; // Übersetzen oder den Originalnamen beibehalten

    // Speichern der Daten im LocalStorage
    savePlace(translatedCountry, timestamp);

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

// Speichern der besuchten Orte im LocalStorage
function savePlace(country, timestamp) {
    const visitedDate = prompt("Kada ste bili ovdje?"); // Benutzer gibt das Datum ein
    let places = JSON.parse(localStorage.getItem('places')) || [];
    places.push({ country, timestamp, visitedDate });
    localStorage.setItem('places', JSON.stringify(places));
}

// Laden der gespeicherten Orte
function loadPlaces() {
    let places = JSON.parse(localStorage.getItem('places')) || [];
    places.forEach(place => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <b>Država:</b> ${place.country} <br>
            <b>Dodano:</b> ${place.timestamp} <br>
            <label>Kada ste bili ovdje?</label>
            <input type="text" value="${place.visitedDate}" placeholder="npr. srpanj 2023">
            <button onclick="deletePlace('${place.country}', '${place.timestamp}')">Izbriši</button>
        `;
        placesList.appendChild(listItem);
    });
}

// Löschen eines gespeicherten Ortes
function deletePlace(country, timestamp) {
    if (confirm(`Da li ste sigurni da želite izbrisati ${country}?`)) {
        let places = JSON.parse(localStorage.getItem('places')) || [];
        places = places.filter(place => place.country !== country || place.timestamp !== timestamp);
        localStorage.setItem('places', JSON.stringify(places));
        loadPlaces(); // Die Liste nach dem Löschen neu laden
    }
}

// Beim Laden der Seite die gespeicherten Orte anzeigen
window.addEventListener('load', loadPlaces);
