"use client";
import { useEffect, useState } from "react";

const DustbinPage = ({ params }) => {
  const [bin, setBin] = useState({});
  useEffect(() => {
    const fetchBin = async () => {
      const { id } = await params;
      console.log("Fetching data for bin ID:", id);
      const res = await fetch(`/api/bins/${id}`);
      const data = await res.json();
      console.log(data);
      setBin(data.data);
    };

    fetchBin();
  }, [params]);

  if (!bin) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  async function updateBin(id){
    const res = await fetch(`/api/bins/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isFull:!bin.isFull,
      }),
    });
    const updatedBin = await res.json();
    setBin(updatedBin.data);
  }

  // Render bin details when data is available
  return (
    <div className="relative p-3 bg-zinc-100 flex-1 rounded-3xl flex flex-col gap-3">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Dustbin Details
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <p className="text-lg font-medium text-gray-700">
              <strong>ID:</strong> {bin.binId}
            </p>
            <p className="text-lg font-medium text-gray-700">
              <strong>Location:</strong> {bin.defaultCity}
            </p>
          </div>
          <div className="flex flex-col">
            <p className="text-lg font-medium text-gray-700">
              <strong>Status:</strong>{" "}
              <span
                className={`font-bold ${
                  bin.isFull ? "text-red-600" : "text-green-600"
                }`}
              >
                {bin.isFull ? "Filled" : "Empty"}
              </span>
            </p>
            <p className="text-lg font-medium text-gray-700">
              <strong>Created At:</strong>{" "}
              {new Date(bin.createdAt).toLocaleDateString() || "Not available"}
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          {bin.isFull && (
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => alert("Perform action")}
            >
              Collect Bin
            </button>
            
          )}
          <button
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => updateBin(bin._id)}
            >
              Update Bin
            </button>
        </div>
      </div>
    </div>
  );
};

// This will run when you visit a URL like `/dustbins/123`
export default DustbinPage;
