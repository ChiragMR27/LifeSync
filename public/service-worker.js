self.addEventListener('push', function(event) {
  let title = 'LifeSync';
  let body = 'You have a new notification.';
  
  if (event.data) {
    try {
      // Try to parse the JSON from your Java backend
      const data = event.data.json();
      title = data.title || title;
      body = data.body || body;
    } catch (e) {
      // If parsing fails (e.g., due to quotes in the text), fall back to raw text
      body = event.data.text(); 
    }
  }

  const options = {
    body: body,
    icon: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: { dateOfArrival: Date.now(), url: self.registration.scope }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // If the app is already open in a tab, just focus it
      if (windowClients.length > 0) {
        return windowClients[0].focus();
      } else {
        // Otherwise, open a new window to the app
        return clients.openWindow('/');
      }
    })
  );
});