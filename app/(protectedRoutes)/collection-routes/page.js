"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { toast } from "react-toastify";
import { RxCross2 } from "react-icons/rx";
import { MdMyLocation } from "react-icons/md";

import GoogleMapComponent from "@/app/components/GoogleMap";
import ActiveRoutes from "@/app/components/ActiveRoutes";

const CollectionRoutesPage = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "geometry"],
  });


  const router = useRouter();
  const { data: session, status } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [routeLocation, setRouteLocation] = useState({
    start: "",
    end: "",
  });
  const [routeData, setRouteData] = useState(null);
  const [isNewRoute, setIsNewRoute] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRoutes, setActiveRoutes] = useState([]);

  // Fetch active routes
  const fetchActiveRoutes = async () => {
    try {
      const id = session.user.id;
      const response = await fetch(`/api/collection-routes/${id}`);
      const data = await response.json();
      if (data.success) {
        setActiveRoutes(data.routes);
      } else {
        toast.error(data.error || "Error fetching active routes");
      }
    } catch (error) {
      console.log("Error fetching active routes:", error);
    }
  };

  useEffect(() => {
    if (status === "loading") return; // Don't do anything if session is still loading
    if (!session) {
      router.push("/login");
      return;
    }

    console.log("Session:", session);

    fetchActiveRoutes();
  }, [status, session, router]);

  const handleOpenForm = () => {
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Route location:", routeLocation);
    if (
      !routeLocation.start ||
      !routeLocation.end ||
      routeLocation.start.trim() === "" ||
      routeLocation.end.trim() === ""
    ) {
      toast.error("Start and end locations are required");
      return;
    }
    try {
      const response = await fetch(
        `/api/collection-routes?start=${routeLocation.start}&end=${routeLocation.end}`
      );
      const data = await response.json();

      console.log("Route data:", data);
      if (data.data) {
        setRouteData(data.data);
      } else {
        toast.error(data.error || "Error generating route");
      }

      setShowForm(false);
      setRouteLocation({ start: "", end: "" });
    } catch (error) {
      console.log("Error generating route:", error);
    } finally {
      setIsLoading(false);
      setShowForm(false);
      setIsNewRoute(true);
    }
  };

  const getCurrentLocation = (key) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setRouteLocation({
          ...routeLocation,
          [key]: `${lat}, ${lng}`,
        });
      });
    } else {
      toast.error("Geolocation is not supported by this browser");
    }
  };

  const handleNewRoute = async() => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/collection-routes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            collectorId: session.user.id,
            start: routeData.start,
            end: routeData.end,
            binIds: routeData.fullBins.map(bin => bin._id)
          }),
        }
      );
      const data = await response.json();
      console.log("New route response:", data);
      if (data.success) {
        toast.success("Route created successfully");
        fetchActiveRoutes();
      } else {
        toast.error(data.error || "Failed to create route");
      }
    } catch (error) {
      console.log("Error creating route:", error);
    } finally {
      setIsLoading(false);
      setIsNewRoute(false);
      setRouteData(null);
    }
  }
  return (
    <div className="w-full sm:w-5/6 h-full overflow-x-hidden relative p-3 bg-zinc-100 flex-1 rounded-3xl flex flex-col gap-3">
      {showForm && (
        <div
          className={`form-container flex absolute z-10 p-3 md:p-0 bg-slate-100/80 w-full h-full top-0 left-0 rounded-3xl  items-center justify-center`}
        >
          <form
            action=""
            onSubmit={handleSubmit}
            className="getrouteform relative w-full lg:w-1/3 bg-white p-4 rounded-3xl flex flex-col gap-2"
          >
            <div className="header">
              <h2 className="text-center font-semibold text-2xl mb-1">
                Generate Route
              </h2>
              <button
                onClick={handleCloseForm}
                className="close-btn absolute top-3 right-3 p-1 font-semibold rounded-full text-red-600 focus:outline-none"
              >
                <RxCross2 size={"1.3em"} className="text-red" />
              </button>
            </div>
            <h3 className="text-sm">
              Enter the start and end locations of trip to generate the route
            </h3>
            <div className="flex flex-col w-full">
              <label className="text-sm font-semibold px-1" htmlFor="start">
                Start Location
              </label>
              <div className="flex gap-2 w-full justify-between">
                <Autocomplete
                  className="flex-1"
                  onPlaceChanged={function () {
                    const place = this.getPlace();
                    //get string address and set it to the state
                    setRouteLocation({
                      ...routeLocation,
                      start: place.formatted_address,
                    });
                  }}
                >
                  <input
                    type="text"
                    name="start"
                    id="start"
                    value={routeLocation.start}
                    className="border-2 border-slate-300 px-3 p-2 w-full rounded-3xl"
                    placeholder="Enter start location"
                    required
                    onChange={(e) =>
                      setRouteLocation({
                        ...routeLocation,
                        start: e.target.value,
                      })
                    }
                  />
                </Autocomplete>
                <button
                  onClick={() => getCurrentLocation("start")}
                  type="button"
                  className="p-1 flex items-center justify-center w-11 h-11 bg-green-500 text-white rounded-full font-semibold text-xs md:text-sm"
                >
                  <MdMyLocation size={"1.45em"} />
                </button>
              </div>
            </div>
            <div className="flex flex-col w-full">
              <label className="text-sm font-semibold px-1" htmlFor="end">
                End Location
              </label>
              <div className="flex gap-2 w-full justify-between ">
                <Autocomplete
                  className="flex-1"
                  onPlaceChanged={function () {
                    const place = this.getPlace();
                    //get string address and set it to the state
                    setRouteLocation({
                      ...routeLocation,
                      end: place.formatted_address,
                    });
                  }}
                >
                  <input
                    type="text"
                    name="end"
                    id="end"
                    value={routeLocation.end}
                    className="border-2 border-slate-300 px-3 p-2 w-full rounded-3xl"
                    placeholder="Enter end location"
                    required
                    onChange={(e) =>
                      setRouteLocation({
                        ...routeLocation,
                        end: e.target.value,
                      })
                    }
                  />
                </Autocomplete>
                <button
                  onClick={() => getCurrentLocation("end")}
                  type="button"
                  className="p-2 flex items-center justify-center w-11 h-11 bg-green-500 text-white rounded-full font-semibold text-xs md:text-sm"
                >
                  <MdMyLocation size={"1.45em"} />
                </button>
              </div>
            </div>
            <div className="submit-btn mt-2">
              <button
                disabled={isLoading}
                type="submit"
                className="p-1 w-full bg-blue-500 rounded-full text-white font-semibold"
              >
                {isLoading ? "Generating Route..." : "Generate Route"}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="header flex justify-between items-center">
        <h2 className="font-semibold text-xl">Routes</h2>
        <div className="actions">
          <button
            className="p-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
            onClick={handleOpenForm}
          >
            Generate Route
          </button>
        </div>
      </div>
      <hr className="border border-slate-300" />
      <div className="w-full">
        <ActiveRoutes
          activeRoutes={activeRoutes}
          isLoaded={isLoaded}
          setRouteData={setRouteData}
          fetchActiveRoutes={fetchActiveRoutes}
          setIsNewRoute={setIsNewRoute}
        />
      </div>
      <div className="flex relative flex-col gap-3 p-3 w-full">
        {routeData && isNewRoute && (
          <div className="absolute z-10 top-5 left-5">
            <button
              onClick={() => handleNewRoute()}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-semibold"
            >
              Accept Route
            </button>
          </div>
        )}
        {routeData && (
          <GoogleMapComponent routeData={routeData} isLoaded={isLoaded} />
        )}
      </div>
    </div>
  );
};

export default CollectionRoutesPage;
