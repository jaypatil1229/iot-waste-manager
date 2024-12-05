"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import Dashboard from "../components/Dashboard";
import { getSocket } from "@/lib/socket";
import Loading from "../components/Loading";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const socket = useMemo(() => getSocket(), []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Register the service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

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
    console.log(window.Notification? "notification" : "no notification");

    socket.on("binUpdated", (data) => {
      console.log("Bin updated:", data);
      if ("Notification" in window) {
        console.log("notificationn found")
        if (Notification?.permission === "granted") {
          // Use the service worker to show the notification
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification("Bin is full!", {
              body: `Bin ${data.bin.binId} is now ${
                data.bin.isFull ? "full" : "empty"
              }`,
              data: { binId: data.bin.binId },
              // icon: '/path-to-your-icon.png', // Optional: Use an icon for the notification
            });
          });
        }
      }else{
        console.log("Notification is not supported.");
      }
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
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (status === "loading") {
    return <Loading/>;
  }

  if (!session) {
    router.push("/login"); // Redirect to login page if not authenticated
    return null;
  }

  return (
    <main className="w-full sm:w-5/6 h-full overflow-x-hidden">
      <Dashboard />
    </main>
  );
}
