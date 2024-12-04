"use client";
import Map from "@/app/components/Map";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { PiSealWarningBold } from "react-icons/pi";
import { LuBadgeCheck } from "react-icons/lu";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { getSocket } from "@/lib/socket";

const DustbinPage = ({ params }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bin, setBin] = useState(null); // Initialize with `null` instead of empty object
  const [loading, setLoading] = useState(true);
  const socket = useMemo(() => getSocket(), []);
  // const [binCollections, setBinCollections] = useState([]);
  // const [binData, setBinData] = useState(null);

  // Fetch bin data when component mounts
  useEffect(() => {
    const fetchBin = async () => {
      const { id } = await params;
      console.log("Fetching data for bin ID:", id);
      try {
        const res = await fetch(`/api/bins/${id}`);
        const data = await res.json();
        console.log(data);
        setBin(data.data);

        // const collectionResponse = await fetch(`/api/bins/${id}/collections`);
        // const collections = await collectionResponse.json();
        // console.log(collections);
        // setBinCollections(collections);
      } catch (error) {
        console.error("Error fetching bin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBin();
  }, [params]);

  useEffect(() => {
    if ("Notification" in window) {
      // Request permission to show notifications
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted!");
        } else {
          console.log("Notification permission denied.");
        }
      });
    } else {
      console.log("Your browser does not support notifications.");
    }

    socket.on("connect", () => {
      console.log("Connected to WebSocket server!");
    });

    socket.on("binUpdated", (data) => {
      console.log("Bin updated:", data);
      setBin(data);
      if (Notification.permission === "granted") {
        new Notification("Bin is full!", {
          body: `Bin ${data.bin.binId} is now ${
            data.bin.isFull ? "full" : "empty"
          }`,
          // icon: '/path-to-your-icon.png', // Optional: Use an icon for the notification
        });
      }
      // if ("Notification" in window) {
      //   // Notification is supported
      //   if (Notification.permission !== "granted") {
      //     Notification.requestPermission().then(function (permission) {
      //       const notification = new Notification("Bin Updated", {
      //         body: `Bin ${data.bin.binId} is now ${
      //           data.bin.isFull ? "full" : "empty"
      //         }`,
      //       });
      //       notification.onclick = function () {
      //         router.push(`/dustbins/${data.bin.binId}`);
      //       };
      //       // notification.vibrate = [100, 50, 100];
      //       // notification.badge = "/favicon.ico";
      //       // notification.icon = "/favicon.ico";
      //       // notification.requireInteraction = true;
      //       // notification.silent = false;
      //       notification.tag = "bin-update-notification";
      //       // notification.renotify = true;
      //       notification.timestamp = Date.now();
      //       notification.show();
      //     });
      //   } else {
      //     const notification = new Notification("Bin Updated", {
      //       body: `Bin ${data.bin.binId} is now ${
      //         data.bin.isFull ? "full" : "empty"
      //       }`,
      //     });
      //     notification.onclick = function () {
      //       router.push(`/dustbins/${data.bin.binId}`);
      //     };
      //     // notification.vibrate = [100, 50, 100];
      //     // notification.badge = "/favicon.ico";
      //     // notification.icon = "/favicon.ico";
      //     // notification.requireInteraction = true;
      //     // notification.silent = false;
      //     notification.tag = "bin-update-notification";
      //     // notification.renotify = true;
      //     notification.timestamp = Date.now();
      //     notification.show();
      //   }
      // } else {
      //   console.log("Notifications are not supported in this browser.");
      // }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!session) {
    toast.error("You must login to access this page");
    router.push("/login"); // Redirect to login page if not authenticated
    return null;
  }
  // Update bin status and trigger a re-render
  async function updateBin(id) {
    setLoading(true); // Set loading true before the update request

    const res = await fetch(`/api/bins/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isFull: !bin.isFull,
        latitude: bin.latitude || 0,
        longitude: bin.longitude || 0,
      }),
    });

    const updatedBin = await res.json();
    console.log(updatedBin);
    setBin(updatedBin.bin); // Update bin state with new data
    setLoading(false);
    toast.success("Bin updated successfully");
  }

  const collectBin = async (id) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/bins/${id}/collections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`, // Ensure access token is being passed
        },
        body: JSON.stringify({ binId: id, collectorId: session?.user.id }),
      });

      const result = await response.json();

      if (response.ok) {
        setBin((prevBin) => ({
          ...prevBin,
          isFull: false,
        }));
        toast.success("Bin Collected!"); // Show success toast
      } else {
        toast.error(result.message); // Show error toast
      }
    } catch (error) {
      toast.error("Failed to collect bin. Please try again.");
    } finally {
      setLoading(false);
    }

    setLoading(false);
  };

  // Loading state display
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg text-gray-500">Loading...</div>
      </div>
    );
  }

  // Render bin details when data is available
  return (
    <div className="relative p-3 bg-zinc-100 flex-1 rounded-3xl flex flex-col gap-3">
      <div className="header w-full">
        <button
          className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full"
          onClick={() => router.push("/dustbins")}
        >
          <IoIosArrowBack className="text-2xl text-gray-500 hover:text-gray-400" />
        </button>
      </div>
      {/* <hr className="border border-slate-300" /> */}
      <div className="info-container w-full max-h-screen flex-1 flex flex-col gap-3">
        <h1 className="text-3xl font-semibold text-gray-800">
          Dustbin Details
        </h1>
        <div className="info-body w-full flex-1 flex gap-3">
          <div className="w-1/2  bg-white shadow-lg rounded-xl p-4 flex flex-col gap-3">
            <div className="bin-info relative flex flex-col gap-1">
              <div className="status absolute top-0 right-0">
                {bin.isFull ? (
                  <span className="flex items-center gap-1 bg-red-100 px-2 py-0.5 rounded-lg justify-center text-red-500 font-semibold">
                    <PiSealWarningBold size={"1.2rem"} /> Full
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded-lg  justify-center text-green-500 font-semibold">
                    <LuBadgeCheck size={"1.2rem"} /> Empty
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Bin ID:{" "}
                <span className="px-2 py-0 bg-slate-200 rounded-lg">
                  {bin.binId}
                </span>
              </h2>
              <hr className="border border-slate-300 mt-1 mb-5" />
              <div className="flex">
                <div className="left w-1/2 flex items-center justify-center">
                  <Image
                    src="/images/trash-can-garbage.jpg"
                    width={200}
                    height={200}
                  ></Image>
                </div>
                <div className="right w-1/2 flex flex-col gap-2 text-lg bg-slate-200 p-2 rounded-xl">
                  <div className="location flex gap-3">
                    <p>
                      <strong>City: </strong>
                      {bin.defaultCity}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    <strong>Created At:</strong>{" "}
                    {new Date(bin.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    <strong>Last Updated:</strong>{" "}
                    {new Date(bin.updatedAt).toLocaleString()}
                  </p>
                  <div className="text-sm text-gray-500 flex flex-col mt-2">
                    <strong>Location</strong>
                    <p className="pl-3">
                      <strong>-Latitude:</strong> {bin.location.latitude || 0}
                    </p>
                    <p className="pl-3">
                      <strong>-Longitude:</strong> {bin.location.longitude || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 justify-center">
              {bin.isFull && (
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => collectBin(bin._id)}
                >
                  Collect Bin
                </button>
              )}
              {session?.user.isAdmin && (
                <button
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => updateBin(bin._id)}
                >
                  Update Bin
                </button>
              )}
            </div>
          </div>
          <div className="map-container w-1/2 bg-white shadow-lg rounded-xl">
            {/* Map component */}
            <Map
              location={bin.location}
              defaultCity={bin.defaultCity}
              markerTitle={`Bin ${bin.binId}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// This will run when you visit a URL like `/dustbins/123`
export default DustbinPage;
