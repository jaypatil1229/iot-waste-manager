"use client";
import React, { useEffect, useState } from "react";

import { GoogleMap, DirectionsRenderer, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = { lat: 19.076, lng: 72.8777 };

const GoogleMapComponent = ({ routeData, isLoaded }) => {
  const [directions, setDirections] = useState(null);
  useEffect(() => {
    if (!isLoaded || !window.google) {
      console.log("Google Maps API not loaded yet.");
      return;
    }
    //use directions service to get the route
    try {
      // use the DirectionsService to get the route
      const directionsService = new google.maps.DirectionsService();
      const origin = routeData.start;
      const destination = routeData.end;
      const waypoints = routeData.waypoints.map((waypoint) => ({
        location: waypoint.location,
        stopover: true,
      }));

      const request = {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          console.log("Directions result:", result);
          setDirections(result);
        } else {
          console.error("Error fetching directions:", status);
        }
      });
    } catch (error) {
      console.log("Error generating route:", error);
    }
  }, [isLoaded, routeData]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
      {/* Render the directions here */}
      {directions && <DirectionsRenderer directions={directions} />}
      {/* Render the markers here different style for empty bins*/}
      {routeData.emptyBins.map((bin) => (
        <Marker
          key={bin._id}
          position={{
            lat: bin.location.latitude,
            lng: bin.location.longitude,
          }}
          icon={{
            url: "/images/green-pin.svg",
            scaledSize: new google.maps.Size(50, 50),
          }}
          label={{
            text: "Bin: " + bin.binId,
            color: "black",
            fontSize: "14px",
            fontWeight: "bold",
            // make it on top of the marker
            textAnchor: "top",
            borderRadius: "5px",
            background: "white",
          }}
        />
      ))}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
