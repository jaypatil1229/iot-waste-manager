"use client";
import React, { useEffect, useState } from "react";
import DashboardAccountInfo from "./DashboardAccountInfo";

const Dashboard = () => {
  const [data, setData] = useState({
    bins: 0,
    collectors: 0,
    binCollections: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch dashboard data from the API
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        console.log(result); // Log to check the data received
        setData(result);
        setLoading(false); // Set loading state to false after data is fetched
      } catch (error) {
        setError(error.message); // If there's an error, set the error state
        setLoading(false); // Stop loading state on error
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div className="w-full flex flex-col rounded-3xl h-full p-3 bg-zinc-100">
      <DashboardAccountInfo />
      <hr className="border border-slate-100 mt-2" />
      <div className="hero flex-1 relative h-2/4 flex flex-col gap-2 items-center justify-center">
        <div class="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:15px_24px] [mask-image:radial-gradient(ellipse_80%_85%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        <h1 className="text-2xl sm:text-[3.5vw] text-center font-semibold text-blue-950">
          IoT Waste Management System
        </h1>
        <p className="text-lg sm:text-xl tracking-tight leading-5 font-medium text-blue-900 text-center">
          Monitor, analyze, and manage your waste bins effectively. ✨
        </p>
      </div>
      <div className="analytics grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
        <div className=" bg-green-100 h-full rounded-xl p-3 flex flex-col gap-2 text-green-800">
          <h2 className="text-lg sm:text-2xl tracking-tight leading-none font-bold px-2 py-1 bg-green-200 w-fit rounded-lg">
            Total Bins
          </h2>
          <p className="text-center text-[6vw] font-bold flex-1 flex justify-center items-center">
            {data.bins}
          </p>
        </div>
        <div className="bg-blue-100 h-full rounded-xl p-3 flex flex-col gap-2 text-blue-800">
          <h2 className="text-lg sm:text-2xl tracking-tight leading-none font-bold px-2 py-1 bg-blue-200 w-fit rounded-lg">
            Total Collectors
          </h2>
          <p className="text-center text-[6vw] font-bold flex-1 flex justify-center items-center">
            {data.collectors}
          </p>
        </div>
        <div className=" bg-red-100 h-full rounded-xl p-3 flex flex-col gap-2 text-red-800">
          <h2 className="text-lg sm:text-2xl tracking-tight leading-none font-bold px-2 py-1 bg-red-200 w-fit rounded-lg">
            Global Bin Collections
          </h2>
          <p className="text-center text-[6vw] font-bold flex-1 flex justify-center items-center">
            {data.binCollections}
          </p>
        </div>
        <div className=" bg-purple-100 h-full rounded-xl p-3 flex flex-col gap-2 text-purple-800">
          <h2 className="text-lg sm:text-2xl tracking-tight leading-none font-bold px-2 py-1 bg-purple-200 w-fit rounded-lg">
            Your Bin Collections
          </h2>
          <p className="text-center text-[6vw] font-bold flex-1 flex justify-center items-center">
            {data.userCollections}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
