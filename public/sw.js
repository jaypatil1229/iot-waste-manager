// public/sw.js

self.addEventListener('push', (event) => {
    const data = event.data.json();
    
    const options = {
      body: data.body,
    //   icon: '/path-to-your-icon.png',
    //   badge: '/badge-icon.png',
      data: { binId: data.binId }  // Store binId in the notification data
    };
  
    // Show the notification
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
  
  // Handle notification clicks
  self.addEventListener('notificationclick', (event) => {
    const binId = event.notification.data.binId;  // Retrieve binId from notification data
    
    // Close the notification when it's clicked
    event.notification.close();
  
    event.waitUntil(
      // Ensure we have access to the client list
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Find an open window that already has the binId URL
        let client = clientList.find((client) => client.url.includes(`/dustbins/${binId}`) && client.visible);
  
        if (client) {
          // If the page is already open, focus on it
          client.focus();
        } else {
          // Otherwise, open a new window/tab with the binId URL
          clients.openWindow(`/dustbins/${binId}`);
        }
      })
    );
  });
  