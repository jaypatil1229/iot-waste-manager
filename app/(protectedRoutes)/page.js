"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import Dashboard from "../components/Dashboard";
import { getSocket } from "@/lib/socket";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const socket = useMemo(() => getSocket(), []);


  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register the service worker
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered with scope:', registration.scope);
      }).catch((error) => {
        console.error('Service Worker registration failed:', error);
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

    socket.on("binUpdated", (data) => {
      console.log("Bin updated:", data);
      if (Notification.permission === 'granted') {
        // Use the service worker to show the notification
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('Bin is full!', {
            body: `Bin ${data.bin.binId} is now ${
              data.bin.isFull ? "full" : "empty"
            }`,
            data: { binId: data.bin.binId }, 
            // icon: '/path-to-your-icon.png', // Optional: Use an icon for the notification
          });
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
    return <div>Loading...</div>;
  }

  if (!session) {
    router.push("/login"); // Redirect to login page if not authenticated
    return null;
  }

  return (
    <main className="w-5/6 flex gap-3 h-full overflow-x-hidden">
      <Dashboard />
    </main>
  );
}
