import { useEffect, useState } from "react";
import L, { marker } from "leaflet";
import "leaflet/dist/leaflet.css";

const Map = ({ defaultCity, location, defaultState, markerTitle }) => {
  // const [coordinates, setCoordinates] = useState({ lat: 19.076, lng: 72.877 });
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    if (location?.latitude || location?.longitude) {
      setCoordinates({ lat: location.latitude, lng: location.longitude });
    } else {
      // Fetch latitude and longitude using OpenStreetMap's Nominatim API
      const fetchCoordinates = async () => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${defaultCity},${
              defaultState ? defaultState : "Maharashtra"
            },India&format=json`
          );
          const data = await response.json();
          if (data && data[0]) {
            setCoordinates({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
          } else {
            console.log("No coordinates found for the city");
          }
        } catch (error) {
          console.log("Error fetching coordinates:", error);
        }
      };

      fetchCoordinates();
    }
  }, [defaultCity]);

  useEffect(() => {
    if (coordinates) {
      const map = L.map("map").setView(coordinates, 10);

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Add a marker at the fetched coordinates
      L.marker(coordinates)
        .addTo(map)
        .bindPopup(`<strong>${markerTitle? markerTitle : defaultCity}</strong>`)
        .openPopup();

      return () => map.remove(); // Clean up map on component unmount
    }
  }, [coordinates, defaultCity]);

  return <div id="map" className="w-full h-full rounded-xl"></div>;
};

export default Map;
