// Define the colorScale function outside the promise chain
var colorScale = d3.scaleLinear()
  .domain([0, 700])
  .range(['#00ff00', '#ff0000']);

// Fetch the earthquake data from the USGS GeoJSON feed
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
  .then(response => response.json())
  .then(data => {
    // Create the map
    var map = L.map('map').setView([0, 0], 2);

    // Add the base map layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Use the fetched data to create the earthquake markers
    data.features.forEach(function(earthquake) {
      var lat = earthquake.geometry.coordinates[1];
      var lng = earthquake.geometry.coordinates[0];
      var depth = earthquake.geometry.coordinates[2];
      var magnitude = earthquake.properties.mag;

      // Calculate the marker size based on magnitude
      var markerSize = 5 + (magnitude * 2);

      // Calculate the marker color based on depth
      var markerColor = colorScale(depth);

      // Create the marker
      var marker = L.circleMarker([lat, lng], {
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.8,
        radius: markerSize
      }).addTo(map);

      // Add a popup with additional information
      marker.bindPopup(`
        <b>Magnitude:</b> ${magnitude}<br>
        <b>Depth:</b> ${depth} km<br>
        <b>Location:</b> (${lat}, ${lng})
      `);
    });

    // Create the legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function(map) {
      var div = L.DomUtil.create('div', 'info legend');
      var grades = [-10, 10, 30, 50, 70, 90];
      
      div.innerHTML = '<h4>Depth Legend</h4>';
      for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
          '<i style="background:' + colorScale(grades[i]) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' km<br>' : '+ km');
      }

      // Add the color scale bar using the same color range
      div.innerHTML += '<h4>Color Scale</h4>';
      div.innerHTML += '<div class="color-scale" style="background: linear-gradient(to right, #00ff00, #ff0000);"></div>';

      return div;
    };
    legend.addTo(map);
  })
  .catch(error => console.error('Error fetching earthquake data:', error));
