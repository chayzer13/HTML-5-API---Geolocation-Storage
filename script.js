let coordinates = {};
let db;

document.getElementById('geo-btn').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            coordinates = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };
            document.getElementById('location').textContent = `Широта: ${coordinates.latitude}, Долгота: ${coordinates.longitude}`;
        }, () => {
            document.getElementById('location').textContent = 'Невозможно определить местоположение';
        });
    } else {
        document.getElementById('location').textContent = 'Геолокация не поддерживается вашим браузером';
    }
});

document.getElementById('localStorageForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const comment = document.getElementById('localComment').value;
    if (comment && coordinates.latitude && coordinates.longitude) {
        saveToLocalStorage(comment, coordinates);
        document.getElementById('localComment').value = '';
    } else {
        alert('Необходимо ввести комментарий и определить местоположение');
    }
});

function saveToLocalStorage(comment, coords) {
    const data = {
        comment: comment,
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: new Date().toISOString()
    };
    const savedData = JSON.parse(localStorage.getItem('geoData')) || [];
    savedData.push(data);
    localStorage.setItem('geoData', JSON.stringify(savedData));
    displayLocalStorageData();
}

function displayLocalStorageData() {
    const savedData = JSON.parse(localStorage.getItem('geoData')) || [];
    const localStorageList = document.getElementById('localStorageList');
    localStorageList.innerHTML = '';
    savedData.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.comment} - Широта: ${entry.latitude}, Долгота: ${entry.longitude}, Время: ${entry.timestamp}`;
        localStorageList.appendChild(li);
    });
}

const request = indexedDB.open('geoDB', 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains('geoDataStore')) {
        db.createObjectStore('geoDataStore', { keyPath: 'id', autoIncrement: true });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    displayIndexedDBData();
};

document.getElementById('indexedDBForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const comment = document.getElementById('dbComment').value;
    if (comment && coordinates.latitude && coordinates.longitude) {
        saveToIndexedDB(comment, coordinates);
        document.getElementById('dbComment').value = '';
    } else {
        alert('Необходимо ввести комментарий и определить местоположение');
    }
});

function saveToIndexedDB(comment, coords) {
    const transaction = db.transaction(['geoDataStore'], 'readwrite');
    const store = transaction.objectStore('geoDataStore');
    const data = {
        comment: comment,
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: new Date().toISOString()
    };
    store.add(data);
    displayIndexedDBData();
}

function displayIndexedDBData() {
    const transaction = db.transaction(['geoDataStore'], 'readonly');
    const store = transaction.objectStore('geoDataStore');
    const request = store.getAll();

    request.onsuccess = () => {
        const data = request.result;
        const indexedDBList = document.getElementById('indexedDBList');
        indexedDBList.innerHTML = '';
        data.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = `${entry.comment} - Широта: ${entry.latitude}, Долгота: ${entry.longitude}, Время: ${entry.timestamp}`;
            indexedDBList.appendChild(li);
        });
    };
}

displayLocalStorageData();
