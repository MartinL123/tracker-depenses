/* Service worker : PWA (installation écran d'accueil) + notifications push FCM en arrière-plan.
   Doit rester à la racine du scope /tracker-depenses/ pour intercepter les notifications. */

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA8tPw48yaI8zCdhSLJXZdCWrKx9bm20Gg",
  authDomain: "tracker-depenses.firebaseapp.com",
  projectId: "tracker-depenses",
  storageBucket: "tracker-depenses.firebasestorage.app",
  messagingSenderId: "622273985032",
  appId: "1:622273985032:web:dc17d4e5c0da2a58746fbd"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Tracker Dépenses";
  const body = payload.notification?.body || "";
  self.registration.showNotification(title, {
    body,
    icon: "/tracker-depenses/icons/icon-192.png",
    badge: "/tracker-depenses/icons/icon-192.png",
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/tracker-depenses/"));
});

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));
