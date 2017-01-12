importScripts('/js/idb.js');
importScripts('/js/store.js');

self.addEventListener('sync', function(event) {
  event.waitUntil(
    store.outbox('readonly').then(function(outbox) {
      return outbox.getAll();
    }).then(function(messages) {
      return Promise.all(messages.map(function(message) {
        return fetch('/messages', {
          method: 'POST',
          body: JSON.stringify(message),
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
          }
        }).then(function(response) {
          return response.json();
        }).then(function(data) {
          if (data.result === 'success') {
            return store.outbox('readwrite').then(function(outbox) {
              return outbox.delete(message.id);
            });
          }
        })
      }))
    }).catch(function(err) {
      console.error(err);
    })
  );
})
