"use client";
import { useEffect } from 'react';

const ServiceWorker = () => {
  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      // Register the service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });

      // Request notification permission
      if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            console.log('Notification permission granted.');
          }
        });
      }
    }
  }, []);

  return null; // This component doesn't render anything, it's just for handling logic
};

export default ServiceWorker;
