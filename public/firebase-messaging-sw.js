/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBBTa78XvNW3CKzIQffibEsZLNAMkLG3m4",
  authDomain: "oguaa-hall-army-cadet.firebaseapp.com",
  projectId: "oguaa-hall-army-cadet",
  messagingSenderId: "239468093433",
  appId: "1:239468093433:web:24fd12bac3639cb2112728",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "OHAC Update";
  const options = {
    body: payload.notification?.body || "You have a new update.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});
