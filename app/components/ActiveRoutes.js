"use client";
import React, { useState } from "react";

import { MdDelete } from "react-icons/md";
import { MdOutlineDone } from "react-icons/md";

import { toast } from "react-toastify";


const ActiveRoutes = ({
  activeRoutes,
  isLoaded,
  setRouteData,
  fetchActiveRoutes,
  setIsNewRoute,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleSetRouteData = (route) => {
    const routeData = {
      start: route.start,
      end: route.end,
      waypoints: route.bins.map((bin) => ({
        location: {
          lat: bin.location.latitude,
          lng: bin.location.longitude,
        },
        stopover: true,
      })),
    };

    setRouteData(routeData);
    setIsNewRoute(false);
  };
  const handleCompleteRoute = async (route) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/collection-routes/${route.collectorId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ routeId: route._id }),
        }
      );
      const data = await response.json();
      console.log("Route completion response:", data);
      if (data.success) {
        toast.success("Route completed successfully");
        fetchActiveRoutes();
      } else {
        toast.error(data.error || "Failed to complete route");
      }
    } catch (error) {
      console.log("Error completing route:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteRoute = async (route) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/collection-routes/${route.collectorId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ routeId: route._id }),
        }
      );
      const data = await response.json();
      console.log("Route deletion response:", data);
      if (data.success) {
        toast.success("Route deleted successfully");
        fetchActiveRoutes();
      } else {
        toast.error(data.error || "Failed to delete route");
      }
    } catch (error) {
      console.log("Error deleting route:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Your Active Routes</h2>
      <div className="w-full flex flex-col gap-2">
        {!activeRoutes ||
          (activeRoutes?.length === 0 && (
            <div className="w-full flex items-center justify-center">
              <h2>No active routes found</h2>
            </div>
          ))}
        {activeRoutes?.map((route, index) => (
          <div
            key={index}
            className="route-card relative flex flex-col gap-1 w-fit p-2 bg-white rounded-lg shadow-md"
          >
            <div className="absolute flex gap-2 top-2 right-2">
              <button
                disabled={isLoading}
                onClick={() => handleCompleteRoute(route)}
                className="text-blue-500 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200"
              >
                <MdOutlineDone />
              </button>
              <button
                disabled={isLoading}
                onClick={() => handleDeleteRoute(route)}
                className="text-red-500 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200"
              >
                <MdDelete />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Created at:{" "}
              {new Date(route.createdAt).toLocaleDateString("en-IN")}
            </p>
            <h2>
              <b>Route Status:</b> {route.status}
            </h2>
            <div className="flex gap-2">
              <h3>
                <b>Start:</b> {route.start}
              </h3>
              <h3>
                <b>End:</b> {route.end}
              </h3>
            </div>
            <div>
              <h3>
                <b>Bins:</b>
              </h3>
              <ul className="flex gap-2">
                {route.bins.map((bin, index) => (
                  <li key={index} className="bg-gray-100 p-2 rounded-lg">
                    <span>
                      <b>Bin:</b> {bin.binId}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              disabled={isLoading}
              onClick={() => handleSetRouteData(route)}
              className="p-1 w-full bg-blue-500 rounded-full text-white font-semibold"
            >
              View Route
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveRoutes;
