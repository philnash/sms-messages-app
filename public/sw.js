const cacheName = "sms-v2";
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
