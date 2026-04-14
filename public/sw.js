// TokenWatch Service Worker — Push Notification Handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "TokenWatch Alert", body: event.data.text() };
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/badge-96.png",
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      { action: "dashboard", title: "Open Dashboard" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "TokenWatch", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dashboard" || !event.action) {
    const url = event.notification.data?.url || "/dashboard";
    event.waitUntil(clients.openWindow(url));
  }
});
