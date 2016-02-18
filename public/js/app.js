if ("serviceWorker" in navigator) {
  swPromise = navigator.serviceWorker.register("/service-worker.js", {
    scope: "/"
  });
  swPromise.then(function(registration) {
    return registration.pushManager.subscribe({ userVisibleOnly: true });
  }).then(function(subscription) {
    return fetch("/subscription", {
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      body: "endpoint="+encodeURI(subscription.endpoint)
    });
  }).catch(function(err) {
    console.log("There was a problem with the Service Worker");
    console.log(err);
  });
}
