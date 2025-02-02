"use client";
import { useEffect, useState } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  LoadScript,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = { lat: 19.076, lng: 72.8777 }; // Example: Mumbai

export default function GMap({ routeData }) {
  console.log("Route data:", routeData);
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    if (routeData && routeData.routes && routeData.routes.length > 0) {
      setDirections(routeData); // Pass the full response, not just routes
    } else {
      console.error("Invalid route data:", routeData);
    }
  }, [routeData]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {directions && (
          <DirectionsRenderer
            directions={directions} 
            options={{ travelMode: "DRIVING" }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}
