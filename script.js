document.addEventListener("DOMContentLoaded", function () {
  var map = L.map("map").setView([20.5937, 78.9629], 5); // Centered on India with zoom level 5

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  var markers = [];

  // Define custom marker icons
  var greenIcon = L.icon({
    iconUrl: "greenmarker.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  var redIcon = L.icon({
    iconUrl: "redmarker.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Function to add source marker on map
  function addSourceMarker(e) {
    var marker = L.marker(e.latlng, { icon: greenIcon }).addTo(map);
    marker.on("click", function () {
      removeMarker(marker);
    });
    markers.push(marker);
  }

  // Function to add destination marker on map
  function addDestinationMarker(e) {
    var marker = L.marker(e.latlng, { icon: redIcon }).addTo(map);
    marker.on("click", function () {
      removeMarker(marker);
    });
    markers.push(marker);
  }

  // Function to remove marker from map
  function removeMarker(markerToRemove) {
    var index = markers.indexOf(markerToRemove);
    if (index !== -1) {
      map.removeLayer(markerToRemove);
      markers.splice(index, 1);
    }
  }

  // Event listener for adding source location
  document.getElementById("add-source").addEventListener("click", function () {
    // Remove existing event listeners for map click
    map.off("click", addDestinationMarker);
    // Add event listener for adding source marker
    map.on("click", addSourceMarker);
  });

  // Event listener for adding destination location
  document
    .getElementById("add-destination")
    .addEventListener("click", function () {
      // Remove existing event listeners for map click
      map.off("click", addSourceMarker);
      // Add event listener for adding destination marker
      map.on("click", addDestinationMarker);
    });

  // Event listener for deleting location
  document
    .getElementById("delete-location")
    .addEventListener("click", function () {
      // Stop adding markers when attempting to delete
      map.off("click", addSourceMarker);
      map.off("click", addDestinationMarker);
    });

  // Event listener for creating JSON
  document.getElementById("create-json").addEventListener("click", function () {
    var sourceLocations = [];
    var destinationLocations = [];

    markers.forEach(function (marker) {
      var location = {
        latitude: marker.getLatLng().lat,
        longitude: marker.getLatLng().lng,
      };
      if (marker.options.icon === greenIcon) {
        sourceLocations.push(location);
      } else if (
        marker.options.icon === redIcon &&
        !isLocationDuplicate(destinationLocations, location)
      ) {
        destinationLocations.push(location);
      }
    });

    var json = JSON.stringify(
      {
        source: sourceLocations,
        destination: destinationLocations,
      },
      null,
      2
    );
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "locations.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // Function to check if a location already exists in the array
  function isLocationDuplicate(locationsArray, location) {
    return locationsArray.some(function (existingLocation) {
      return (
        existingLocation.latitude === location.latitude &&
        existingLocation.longitude === location.longitude
      );
    });
  }
});
