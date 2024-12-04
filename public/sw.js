self.addEventListener('push', (event) => {
    const options = {
      body: event.data.text(),
    //   icon: '/images/icon.png',  // Make sure you have an icon in the public folder
    //   badge: '/images/badge.png',  // Optional: Add a badge image
    };
  
    event.waitUntil(
      self.registration.showNotification('New Event', options)
    );
  });
  