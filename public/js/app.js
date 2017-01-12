document.addEventListener('DOMContentLoaded', function(event) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(function(reg) {
      if ('sync' in reg) {
        var form = document.querySelector('.js-background-sync');
        var phoneNumberField = form.querySelector('#phoneNumber');
        var bodyField = form.querySelector('#body');

        form.addEventListener('submit', function(event) {
          event.preventDefault();
          var message = {
            phoneNumber: phoneNumberField.value,
            body: bodyField.value
          };
          store.outbox('readwrite').then(function(outbox) {
            return outbox.put(message);
          }).then(function() {
            bodyField.value = '';
            if (phoneNumberField.getAttribute('type') !== 'hidden') {
              phoneNumberField.value = '';
            }
            return reg.sync.register('outbox');
          }).catch(function(err) {
            // something went wrong with the database or the sync registration, log and submit the form
            console.error(err);
            form.submit();
          });
        });
      }
    }).catch(function(err) {
      console.error(err); // the Service Worker didn't install correctly
    });
  }
});
