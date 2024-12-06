// Marker-Array und DOM-Referenzen
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

// Karte initialisieren
const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Benutzerdefiniertes Marker-Bild
const customIcon = L.icon({
    iconUrl: 'assets/custom-marker.jpg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Event beim Klicken auf die Karte
map.on('click', async function (e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Land über OpenStreetMap-API holen
    const country = await getCountryName(lat, lng);
    const translatedCountry = countryTranslations[country] || country;

    // Zeit und Benutzereingabe
    const timestamp = new Date().toLocaleString();
    const visitedDate = prompt("Kada ste bili ovdje?"); // Benutzer gibt Besuchsdatum ein

    // Marker erstellen
    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
    markers.push(marker);

    // Popup für den Marker
    marker.bindPopup(`Država: ${translatedCountry}<br>Vrijeme: ${timestamp}`).openPopup();

    // Ort speichern und Liste sofort aktualisieren
    savePlace(translatedCountry, timestamp, visitedDate);
    updatePlacesList(); // Liste neu laden
});

// Funktion, um den Ländernamen zu holen
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

// Ort speichern
function savePlace(country, timestamp, visitedDate) {
    let places = JSON.parse(localStorage.getItem('places')) || [];
    places.push({ country, timestamp, visitedDate });
    localStorage.setItem('places', JSON.stringify(places));
}

// Liste der Orte laden
function updatePlacesList() {
    placesList.innerHTML = ''; // Alte Liste löschen
    const places = JSON.parse(localStorage.getItem('places')) || [];
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

// Ort löschen
function deletePlace(country, timestamp) {
    if (confirm(`Da li ste sigurni da želite izbrisati ${country}?`)) {
        let places = JSON.parse(localStorage.getItem('places')) || [];
        places = places.filter(place => place.country !== country || place.timestamp !== timestamp);
        localStorage.setItem('places', JSON.stringify(places));
        updatePlacesList(); // Liste neu laden
    }
}

// Beim Laden der Seite die Orte anzeigen
window.addEventListener('load', updatePlacesList);
