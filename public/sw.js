// public/sw.js

self.addEventListener('push', (event) => {
    const data = event.data.json();
  
    const options = {
      body: data.body,
      icon: '/path-to-your-icon.png',
      badge: '/badge-icon.png',
    };
  
    // Save the binId in the notification options for use on click
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
  
  self.addEventListener('notificationclick', (event) => {
    const binId = event.notification.data.binId; // Get the binId from the notification data
  
    event.notification.close();
  
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        let client = clientList.find((client) => client.url === `/bins/${binId}` && client.visible);
        
        if (client) {
          // Focus on the existing window if it's already open
          client.focus();
        } else {
          // Otherwise, open a new window/tab with the /bins/{binId} page
          client.openWindow(`/bins/${binId}`);
        }
      })
    );
  });
  