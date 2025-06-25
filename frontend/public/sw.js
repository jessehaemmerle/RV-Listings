// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    const urlToOpen = event.notification.data.url || '/';
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window' })
        .then(clientList => {
          // Check if app is already open
          for (let client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window
          if (self.clients.openWindow) {
            return self.clients.openWindow(urlToOpen);
          }
        })
    );
  }
});