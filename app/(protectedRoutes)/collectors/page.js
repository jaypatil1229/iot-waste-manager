"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IoPersonAdd } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-toastify";
import { RiDeleteBin6Line } from "react-icons/ri";
import Loading from "@/app/components/Loading";

const CollectorsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCollector, setNewCollector] = useState({
    name: "",
    email: "",
    city: "",
    password: "",
  });

  useEffect(() => {
    // Redirect to sign-in if no session exists
    if (status === "loading") return; // Don't do anything if session is still loading
    if (!session) {
      router.push("/login");
      return;
    }

    async function fetchCollectors() {
      try {
        const res = await fetch("/api/collectors");
        const data = await res.json();

        if (res.ok) {
          setCollectors(data.data); // Update state with the list of collectors
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

    fetchCollectors();
  }, [session, status, router]);

  const handleOpenForm = () => {
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(newCollector)
    try {
      const res = await fetch("/api/collectors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCollector),
      });

      if (!res.ok) {
        throw new Error("Failed to create collector");
      }

      const data = await res.json();
      setCollectors((prev) => [...prev, data]); // Update collectors list with the new collector
      setShowForm(false); // Close the form
      setNewCollector({ name: "", email: "", password: "" }); // Reset the form
      toast.success("Collector created successfully");
    } catch (error) {
      console.error("Error creating collector:", error);
      toast.error("Failed to create collector");
    }


    setShowForm(false);
  };

  const handleDelete = async (id) => {
    console.log("Delete triggered for id:", id);
    const confirmDelete = window.confirm("Are you sure you want to delete this collector?");
    if (confirmDelete) {
      try {
        const res = await fetch(`/api/collectors/${id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          // If successful, remove the deleted collector from the state
          setCollectors((prevCollectors) =>
            prevCollectors.filter((collector) => collector._id !== id)
          );
          toast.success("Collector deleted successfully");
        } else {
          // console.error("Failed to delete collector");
          console.error(res.error)
          toast.error("Failed to delete collector");
        }
      } catch (error) {
        console.error("Error deleting collector:", error);
        toast.error("Failed to delete collector");
      }
    }
  };

  if (loading) return <Loading/>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="w-full sm:w-5/6 h-full overflow-x-hidden p-3 bg-zinc-100 rounded-3xl flex flex-col gap-3">
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
                Create Collector
              </h2>
              <button
                onClick={handleCloseForm}
                className="close-btn absolute top-3 right-3 p-1 font-semibold rounded-full text-red-600 focus:outline-none"
              >
                <RxCross2 size={"1.3em"} className="text-red" />
              </button>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold px-1" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="border-2 border-slate-300 px-3 p-2 rounded-3xl w-72"
                placeholder="Enter name of collector"
                required
                onChange={(e) =>
                  setNewCollector({ ...newCollector, name: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold px-1" htmlFor="city">
                City
              </label>
              <input
                type="text"
                name="city"
                id="city"
                className="border-2 border-slate-300 px-3 p-2 rounded-3xl w-72"
                placeholder="Enter city name"
                required
                onChange={(e) =>
                  setNewCollector({ ...newCollector, city: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold px-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="border-2 border-slate-300 px-3 p-2 rounded-3xl w-72"
                placeholder="Enter email ID"
                required
                onChange={(e) =>
                  setNewCollector({ ...newCollector, email: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold px-1" htmlFor="password">
                Password
              </label>
              <input
                type="text"
                name="password"
                id="password"
                className="border-2 border-slate-300 px-3 p-2 rounded-3xl w-72"
                placeholder="enter password"
                required
                onChange={(e) =>
                  setNewCollector({ ...newCollector, password: e.target.value })
                }
              />
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
        <h2 className="font-semibold text-xl ml-6">Collectors</h2>
        <div className="options flex gap-3">
          {session.user.isAdmin && (
            <button
              onClick={handleOpenForm}
              className="px-3 py-2 bg-blue-500 rounded-full text-white font-semibold flex items-center gap-2"
            >
              <IoPersonAdd />
              <span>Add Collector</span>
            </button>
          )}
        </div>
      </div>
      <hr className="border border-slate-300" />
      {collectors.length === 0 ? (
        <p>No collectors found.</p>
      ) : (
        <div className="collectors w-full h-full overflow-y-scroll">
          <table className="min-w-full table-auto max-h-screen overflow-y-scroll text-sm sm:text-base
          ">
            <thead>
              <tr className="">
                <th className="border-b-2 py-1">Name</th>
                <th className="border-b-2 py-1">Email</th>
                <th className="border-b-2 py-1 hidden sm:block">City</th>
                <th className="border-b-2 py-1">Bins Collected</th>
                <th className="border-b-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collectors.map((collector, index) => {
                return (
                  <tr key={index}>
                    <td className="text-center p-1">{collector.name}</td>
                    <td className="text-center p-1 ">{collector.email}</td>
                    <td className="text-center p-1 hidden sm:block">{collector.city}</td>
                    <td className="text-center p-1">
                      {collector.binsCollected}
                    </td>
                    <td className="flex gap-2 justify-center items-center p-1">
                      <button onClick={() => handleDelete(collector._id)} className="px-2 sm:px-3 py-2 bg-red-500 rounded-full text-white font-semibold">
                        <span className="sm:hidden"><RiDeleteBin6Line /></span>
                        <span className="hidden sm:block">Delete</span>
                      </button>
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

export default CollectorsPage;
