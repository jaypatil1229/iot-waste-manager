import React from "react";
import DashboardAccountInfo from "./DashboardAccountInfo";


const Dashboard = () => {
  return (
    <div className="w-full flex flex-col gap-2 rounded-3xl h-full p-3 bg-zinc-100">
        <DashboardAccountInfo/>
        <hr className="border border-slate-300"/>
    </div>
  );
};

export default Dashboard;
