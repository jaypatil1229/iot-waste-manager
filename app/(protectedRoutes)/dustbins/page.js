"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaRegEye } from "react-icons/fa";
import Loading from "@/app/components/Loading";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBin, setNewBin] = useState({
    id: "",
    pin: "",
    capacity: "",
    defaultCity: "",
    cityAddress: "",
  });

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "geometry"],
  });

  async function fetchBins() {
    try {
      const res = await fetch("/api/bins");
      const data = await res.json();

      if (res.ok) {
        setBins(data.data); // Update state with the list of collectors
      } else {
        setError(data.error || "Failed to fetch collectors");
      }
    } catch (err) {
      console.error("Error fetching collectors:", err);
      setError("An error occurred while fetching collectors");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    // Redirect to sign-in if no session exists
    if (status === "loading") return; // Don't do anything if session is still loading
    if (!session) {
      router.push("/login");
      return;
    }
    fetchBins();
  }, [session, status, router]);

  const handleOpenForm = () => {
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("New bin:", newBin);
    try {
      const res = await fetch("/api/bins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBin),
      });

      if (!res.ok) {
        throw new Error("Failed to create collector");
      }

      await fetchBins();
      setShowForm(false); // Close the form
      setNewBin({ name: "", pin: "", email: "", password: "" }); // Reset the form
      toast.success("Dustbin created successfully");
    } catch (error) {
      console.error("Error creating dustbin:", error);
      toast.error("Failed to create dustbin");
    }

    setShowForm(false);
  };

  const handleDelete = async (bin) => {
    if (bin.status === "processing") {
      toast.error("Bin cannot be deleted because it has collections pending");
      setLoading(false);
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bin?"
    );
    if (confirmDelete) {
      setLoading(true);
      try {
        const res = await fetch(`/api/bins/${bin._id}`, {
          method: "DELETE",
        });
        const response = await res.json();
        console.log(response);

        if (res.ok) {
          setBins((prevBins) => prevBins.filter((prevbin) => bin._id !== prevbin._id));
          toast.success("Dustbin deleted successfully");
        } else {
          console.error(res.error);
          toast.error("Failed to delete dustbin");
        }
      } catch (error) {
        console.error("Error deleting collector:", error);
        toast.error("Failed to delete dustbin");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewClick = (binId) => {
    // Navigate to the dustbin's page using the bin's ID
    router.push(`/dustbins/${binId}`);
  };

  if (loading) return <Loading />;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="w-full sm:w-5/6 h-full overflow-x-hidden relative p-3 bg-zinc-100 flex-1 rounded-3xl flex flex-col gap-3">
      {showForm && (
        <div
          className={`form-container flex absolute z-10 bg-slate-100/80 w-full h-full top-0 left-0 rounded-3xl  items-center justify-center`}
        >
          <form
            action=""
            onSubmit={handleSubmit}
            className="createCollectorForm relative bg-white p-4 rounded-3xl flex flex-col gap-2"
          >
            <div className="header">
              <h2 className="text-center font-semibold text-2xl mb-1">
                Create Dustbin
              </h2>
              <button
                onClick={handleCloseForm}
                className="close-btn absolute top-3 right-3 p-1 font-semibold rounded-full text-red-600 focus:outline-none"
              >
                <RxCross2 size={"1.3em"} className="text-red" />
              </button>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold px-1" htmlFor="binId">
                Dustbin ID
              </label>
              <input
                type="text"
                name="binId"
                id="binId"
                className="border-2 border-slate-300 px-3 p-2 rounded-3xl w-72"
                placeholder="Enter dustbin ID"
                required
                onChange={(e) =>
                  setNewBin({ ...newBin, binId: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold px-1" htmlFor="pin">
                Pin
              </label>
              <input
                type="text"
                name="pin"
                id="pin"
                className="border-2 border-slate-300 px-3 p-2 rounded-3xl w-72"
                placeholder="Enter dustbin pin(safety purpose)"
                required
                onChange={(e) => setNewBin({ ...newBin, pin: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold px-1" htmlFor="capacity">
                Capacity
              </label>
              <input
                type="text"
                name="capacity"
                id="capacity"
                className="border-2 border-slate-300 px-3 p-2 rounded-3xl w-72"
                placeholder="Enter capacity in litres"
                required
                onChange={(e) =>
                  setNewBin({ ...newBin, capacity: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label
                className="text-sm font-semibold px-1"
                htmlFor="defaultCity"
              >
                Default City
              </label>
              <Autocomplete
                className="flex-1"
                onPlaceChanged={function () {
                  const place = this.getPlace();
                  setNewBin({
                    ...newBin,
                    defaultCity: place.name,
                    cityAddress: place.formatted_address,
                  });
                }}
                options={
                  isLoaded
                    ? {
                        //add types to restrict the search to cities, towns, streets etc
                        types: ["geocode"],
                      }
                    : {}
                }
              >
                <input
                  type="text"
                  name="defaultCity"
                  id="defaultCity"
                  className="border-2 border-slate-300 px-3 p-2 rounded-3xl w-72"
                  placeholder="Enter default city"
                  required
                  onChange={(e) =>
                    setNewBin({ ...newBin, defaultCity: e.target.value })
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
        <h2 className="font-semibold text-xl ml-6">Dustbins</h2>
        <div className="options flex gap-3">
          {session.user.isAdmin && (
            <button
              onClick={handleOpenForm}
              className="px-3 py-2 bg-blue-500 rounded-full text-white font-semibold flex items-center gap-2"
            >
              <FaPlus />
              <span>Add Dustbin</span>
            </button>
          )}
        </div>
      </div>
      <hr className="border border-slate-300" />
      {bins.length === 0 ? (
        <p>No Bins found.</p>
      ) : (
        <div className="bins w-full h-full overflow-y-scroll">
          <table className="min-w-full table-auto max-h-screen overflow-y-scroll text-sm sm:text-base">
            <thead>
              <tr>
                <th className="border-b-2 py-1">Dustbin ID</th>
                <th className="border-b-2 py-1 hidden sm:block">
                  Capacity&#40;ltr&#41;{" "}
                </th>
                <th className="border-b-2 py-1">Default City</th>
                <th className="border-b-2 py-1">Bins Status</th>
                <th className="border-b-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bins.map((bin, index) => {
                return (
                  <tr key={index}>
                    <td className="text-center p-1">{bin.binId}</td>
                    <td className="text-center p-1 hidden sm:block">
                      {bin.capacity}
                    </td>
                    <td className="text-center p-1">{bin.defaultCity}</td>
                    {/* add td for bin status which can be full, empty or processing different colors for different status*/}
                    <td
                      className={`text-center p-1 font-semibold capitalize
                        ${
                          bin.status === "processing"
                            ? "text-yellow-500"
                            : bin.status === "full"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                    >
                      {bin.status}
                    </td>
                    <td className="flex gap-2 justify-center items-center p-1">
                      <button
                        onClick={() => handleViewClick(bin.binId)}
                        className="px-2 sm:px-3 py-2 bg-blue-500 rounded-full text-white font-semibold"
                      >
                        <span className="sm:hidden">
                          <FaRegEye />
                        </span>
                        <span className="hidden sm:block">View</span>
                      </button>
                      {session?.user.isAdmin && (
                        <button
                          disabled={loading}
                          onClick={() => handleDelete(bin)}
                          className="px-2 sm:px-3 py-2 bg-red-500 rounded-full text-white font-semibold"
                        >
                          <span className="sm:hidden">
                            <RiDeleteBin6Line />
                          </span>
                          <span className="hidden sm:block">Delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Page;
