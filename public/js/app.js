if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(function(registration) {
    console.log("Service Worker registered succesfully.");
  }).catch(function(err) {
    console.log("Service Worker could not register:", err);
  });
}
