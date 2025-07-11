// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
//   attribution: 'Tiles © Esri'
// }).addTo(map);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);




const markers = L.markerClusterGroup({
    
    iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let iconSize;
        let className = 'custom-cluster-icon ';

        if (count < 10) {
            iconSize = [30, 30];
            className += 'custom-cluster-small';
        } else if (count < 100) {
            iconSize = [40, 40];
            className += 'custom-cluster-medium';
        } else {
            iconSize = [50, 50];
            className += 'custom-cluster-large';
        }

        
        return L.divIcon({
            html: `<div><span>${count}</span></div>`, 
            className: className,
            iconSize: L.point(iconSize[0], iconSize[1])
        });
    },

});


let allStudentsData = [];
const allMarkers = []; 
// --- Get filter elements ---
const programFilter = document.getElementById('program-filter');
const countryFilter = document.getElementById('country-filter');

// Default image paths (using your new structure)
const defaultMirsPhoto = 'data/images/default-mirs.png';
const defaultIfrosPhoto = 'data/images/default-ifros.png';

// Fetch student data
fetch('data/students.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return response.json();
  })
  .then(data => {
    allStudentsData = data; // Store all data
    populateCountryFilter(allStudentsData); // Populate country dropdown
    updateMapMarkers(); // Initial population of markers

    // --- Add event listeners for filters ---
    programFilter.addEventListener('change', updateMapMarkers);
    countryFilter.addEventListener('change', updateMapMarkers);
  })
  .catch(error => {
    console.error('Error loading student data:', error);
    // Display a user-friendly error message on the page if needed
    const mapDiv = document.getElementById('map');
    mapDiv.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">Error loading student data. Please check the console or try again later.</p>`;
  });

function populateCountryFilter(students) {
    const countries = new Set(); // Use a Set to get unique country names
    students.forEach(student => {
        if (student.country) {
            countries.add(student.country.trim());
        }
    });

    // Sort countries alphabetically
    const sortedCountries = Array.from(countries).sort();

    sortedCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

function updateMapMarkers() {
    markers.clearLayers(); // Clear existing markers from the cluster group

        const selectedProgram = programFilter.value.trim();
        const selectedCountry = countryFilter.value;

        const filteredStudents = allStudentsData.filter(student => {
            const programMatch =
                selectedProgram === 'all' ||
                student.program.trim().toLowerCase() === selectedProgram.toLowerCase();

            const countryMatch =
                selectedCountry === 'all' ||
                student.country.trim().toLowerCase() === selectedCountry.toLowerCase();

            return programMatch && countryMatch;
        });

    filteredStudents.forEach(student => {
        const programClass = student.program.toLowerCase(); // "mirs" or "ifros"
        const borderColor = programClass === 'mirs' ? '#222e5b' : '#222e5b'
        // Use the correct default photo path based on program
        const defaultPhoto = programClass === 'mirs' ? defaultMirsPhoto : defaultMirsPhoto

        // Ensure student.photo is a valid path or empty string
        const studentPhotoPath = student.photo && student.photo.trim() !== '' ? student.photo : defaultPhoto;

        const customIcon = L.divIcon({
            className: 'circular-marker',
            html: `<img src="${studentPhotoPath}" alt="${student.name}" onerror="this.onerror=null;this.src='${defaultPhoto}';" />`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });

        const marker = L.marker(student.coordinates, { icon: customIcon });


        const customIconWithBorder = L.divIcon({
            className: 'custom-student-marker-wrapper', // A wrapper, if needed
            html: `<div class="circular-marker" style="border-color: ${borderColor};">
                       <img src="${studentPhotoPath}" alt="${student.name}" onerror="this.onerror=null;this.src='${defaultPhoto}';" />
                   </div>`,
            iconSize: [40, 40], // Size of the icon
            iconAnchor: [20, 40], // Point of the icon that corresponds to the marker's location
            popupAnchor: [0, -40] // Point from which the popup should open relative to the iconAnchor
        });
        const finalMarker = L.marker(student.coordinates, { icon: customIconWithBorder });


        const popupContent = `
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${studentPhotoPath}" alt="${student.name}" width="50" height="50" style="border-radius: 50%; object-fit: cover;" onerror="this.onerror=null;this.src='${defaultPhoto}';">
              <div>
                <h3>${student.name}</h3>
                <p class="${programClass}" style="color: ${borderColor}; margin-bottom: 3px; margin-top: 3px;">${student.program} Student</p>
                <p style="margin-bottom: 3px; margin-top: 3px;">${student.info}</p>
                ${student.linkedin ? `<a href="${student.linkedin}" target="_blank" rel="noopener noreferrer">View LinkedIn Profile</a>` : ''}
              </div>
            </div>
        `;
        finalMarker.bindPopup(popupContent);
        markers.addLayer(finalMarker); // Add individual marker to the cluster group
    });

    map.addLayer(markers); // Add the cluster group to the map
}