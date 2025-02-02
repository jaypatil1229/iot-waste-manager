"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

import GoogleMapComponent from "@/app/components/GoogleMap";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { set } from "mongoose";

const CollectionRoutesPage = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "geometry"],
  });

  const { data: session, status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [routeLocation, setRouteLocation] = useState({
    start: "",
    end: "",
  });
  const [routeData, setRouteData] = useState(null);

  useEffect(() => {
    if (status === "loading") return; // Don't do anything if session is still loading
    if (!session) {
      router.push("/login");
      return;
    }
  }, [status, session, router]);

  const handleOpenForm = () => {
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Route location:", routeLocation);
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
      setShowForm(false);
    }
  };

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
              <Autocomplete
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
            </div>
            <div className="flex flex-col w-full">
              <label className="text-sm font-semibold px-1" htmlFor="end">
                End Location
              </label>
              <Autocomplete
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
                  className="border-2 border-slate-300 px-3 p-2 rounded-3xl w-full"
                  placeholder="Enter end location"
                  required
                  onChange={(e) =>
                    setRouteLocation({ ...routeLocation, end: e.target.value })
                  }
                />
              </Autocomplete>
            </div>
            <div className="submit-btn">
              <button
                type="submit"
                className="p-2 w-full bg-blue-500 rounded-full text-white font-semibold"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="header flex justify-between items-center">
        <h2 className="font-semibold text-xl ml-6">Routes</h2>
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
      <div className="flex flex-col gap-3 p-3 w-full">
        {routeData && (
          <GoogleMapComponent routeData={routeData} isLoaded={isLoaded} />
        )}
      </div>
    </div>
  );
};

export default CollectionRoutesPage;
