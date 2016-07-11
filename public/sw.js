const cacheName = "sms-v3";
const fontCache = "sms-font-cache-v2";

function returnFromCache(request, cache) {
  return caches.open(cache).then(function(cache) {
    return cache.match(request);
  });
}

function returnFromCacheOrFetchAndCache(request, cacheName) {
  const cachePromise = caches.open(cacheName);
  const matchPromise = cachePromise.then(function(cache) {
    return cache.match(request);
  })

  return Promise.all([cachePromise, matchPromise]).then(function([cache, cacheResponse]) {
    if (cacheResponse) {
      return cacheResponse;
    } else {
      return fetch(request).then(function(response) {
        cache.put(request, response.clone());
        return response;
      });
    }
  });
}

self.addEventListener("install", function(event) {
  console.log("installed");
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll([
        "/js/app.js",
        "/js/material.min.js",
        "/css/material.min.css",
        "/css/style.css"
      ]);
    })
  )
});

self.addEventListener("activate", function(event) {
  console.log("activated");
});

self.addEventListener("fetch", function(event) {
  const requestURL = new URL(event.request.url);
  if (/^(\/css\/|\/js\/)/.test(requestURL.pathname)) {
    event.respondWith(returnFromCache(event.request, cacheName))
  } else if (requestURL.hostname === "fonts.gstatic.com" || requestURL.hostname === "fonts.googleapis.com") {
    event.respondWith(returnFromCacheOrFetchAndCache(event.request, fontCache));
  }
})

function showNotification(message) {
  console.log(message);
  return self.registration.showNotification("From: " + message.from, {
    body: message.body,
    data: {
      path: "/messages/" + message.from
    }
  });
}

self.addEventListener('push', function(event) {
  console.log(event);
  event.waitUntil(
    fetch("/messages/latest").then(function(data) {
      console.log(data);
      return data.json();
    }).then(showNotification)
  );
});

self.addEventListener('notificationclick', function(event) {
  var url = 'http://localhost:3000' + event.notification.data.path;
  event.waitUntil(
    clients.matchAll().then(function(clientList) {
      event.notification.close();
      if (clientList.length === 0) {
        return clients.openWindow(url);
      } else {
        return clientList[0].focus();
      }
    })
  );
});
