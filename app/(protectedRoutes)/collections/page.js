"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { MdOutlineDone } from "react-icons/md";

const CollectionsPage = () => {
  const { data: session, status } = useSession();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCollections = async () => {
    try {
      const collectorId = session?.user?.id;
      const res = await fetch(`/api/collections?collectorId=${collectorId}`);
      const data = await res.json();
      if (data.success) {
        setCollections(data.collections);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast.error("Error fetching collections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return; // Don't do anything if session is still loading
    if (!session) {
      router.push("/login");
      return;
    }
    console.log("Session:", session);

    fetchCollections();
  }, []);

  const handleCompleteCollection = async (collection) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/collections/${collection._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "completed",
          collectorId: session?.user?.id,
        }),
      });
      const data = await response.json();
      console.log("Collection completion response:", data);
      if (data.success) {
        toast.success("Collection completed successfully");
        fetchCollections();
      } else {
        toast.error(data.error || "Failed to complete collection");
      }
    } catch (error) {
      console.log("Error completing collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollection = async (collection) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/collections/${collection._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ collectorId: session?.user?.id }),
      });
      const data = await response.json();
      console.log("Collection deletion response:", data);
      if (data.success) {
        toast.success("Collection deleted successfully");
        fetchCollections();
      } else {
        toast.error(data.error || "Failed to delete collection");
      }
    } catch (error) {
      console.log("Error deleting collection:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-full sm:w-5/6 h-full overflow-x-hidden relative p-3 bg-zinc-100 flex-1 rounded-3xl flex flex-col gap-3">
      <div className="header flex justify-between items-center">
        <h2 className="font-semibold text-xl ml-6 lg:ml-0">Collections</h2>
      </div>
      <hr className="border border-slate-300" />

      {loading ? (
        <div>Loading.....</div>
      ) : !collections || collections.length === 0 ? (
        <div className="w-full flex items-center justify-center">
          <h2>No pending collections found</h2>
        </div>
      ) : (
        <div className="w-full gap-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {collections.map((collection) => (
            <div
              key={collection._id}
              className="w-full relative bg-white p-3 rounded-xl flex flex-col gap-2"
            >
              <div className="absolute flex gap-2 top-2 right-2">
                <button
                  disabled={loading}
                  onClick={() => handleCompleteCollection(collection)}
                  className="text-blue-500 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200"
                >
                  <MdOutlineDone />
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleDeleteCollection(collection)}
                  className="text-red-500 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200"
                >
                  <MdDelete />
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <span className="font-semibold">Bin:</span>
                <span>{collection.bin.binId}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="font-semibold">Default City:</span>
                <span>{collection.bin.defaultCity}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="font-semibold">Location:</span>
                <span>
                  {collection.bin.location.latitude},{" "}
                  {collection.bin.location.longitude}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="font-semibold">Status:</span>
                <span
                  className={`capitalize font-medium ${
                    collection.status === "processing"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {collection.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;
