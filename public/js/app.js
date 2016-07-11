// TODO: Refactor me. I started out with so much promise. What went wrong Phil?
var Alert = function(templateId) {
  this.template = document.getElementById(templateId);
}

Alert.prototype.prepend = function(element) {
  var clone = document.importNode(this.template.content, true);
  element.insertBefore(clone, element.firstChild);
  this.element = element.querySelector(".alert");
  this.closeButton = this.element.querySelector(".close");
  var _this = this;
  this.closeFunction = function(event) {
    // Set cookie to not show again.
    _this.close();
  }
  this.closeButton.addEventListener("click", this.closeFunction);
  setTimeout(function() {
    _this.element.classList.add("show");
  }, 500);
}

Alert.prototype.close = function() {
  this.element.classList.remove("show");
  var _this = this;
  setTimeout(function() {
    _this.element.remove();
  }, 300);
}

Alert.prototype.remove = function() {
  this.closeButton.removeEventListener("click", this.closeFunction);
  delete this.closeFunction;
  this.element.remove();
}

Alert.prototype.addContents = function(contents) {
  this.element.insertBefore(contents.render(), this.element.firstChild);
}

var PushNotificationForm = function(templateId) {
  this.template = document.getElementById(templateId);
}

PushNotificationForm.prototype.render = function() {
  var clone = document.importNode(this.template.content, true);
  this.input = clone.querySelector('input');
  this.input.addEventListener('change', this.changed.bind(this));
  return clone;
}

PushNotificationForm.prototype.changed = function(event) {
  if (this.input.checked) {
    var _this = this;
    Push.askPermission().then(function(subscription) {
      console.log(subscription);
      var formData = new FormData();
      formData.append("endpoint", subscription.endpoint);
      fetch("/push/subscription", {
        method: "POST",
        body: formData
      }).then(function(response) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("alertClose", false, true);
        document.body.dispatchEvent(evt);
      }).catch(function(err){
        console.log(err);
      });
    }).catch(function(err) {
      // Currently assuming that the error is because of permission denied.
      console.log(err);
      _this.resetToFalse();
      setTimeout(function() {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("alertClose", false, true);
        document.body.dispatchEvent(evt);
      }, 500);
    });
  }
}

PushNotificationForm.prototype.change = function() {
  var evt = document.createEvent("HTMLEvents");
  evt.initEvent("change", false, true);
  this.input.dispatchEvent(evt);
}

PushNotificationForm.prototype.resetToFalse = function() {
  this.input.checked = false
  this.change();
}

var Push = {
  options: { userVisibleOnly: true },
  showPushAlert: function() {
    var alert = new Alert("alert");
    var pushNotificationForm = new PushNotificationForm("push-notification-form");
    var mainElt = document.querySelector("main");
    alert.prepend(mainElt);
    alert.addContents(pushNotificationForm);
    document.body.addEventListener("alertClose", function(event) {
      alert.close();
    });
  },
  askPermission: function() {
    return navigator.serviceWorker.ready.then(function(registration) {
      return registration.pushManager.subscribe(Push.options);
    });
  }
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(function(registration) {
    console.log("Service Worker registered succesfully.");
    if ("pushManager" in registration) {
      registration.pushManager.permissionState(Push.options).then(function(state) {
        switch (state) {
          case "prompt":
            console.log("Need permission");
            Push.showPushAlert();
            break;
          case "granted":
            console.log("We're cool");
            break;
          case "denied":
            console.log("No push");
            break;
        }
      })
    }

  }).catch(function(err) {
    console.log("Service Worker could not register:", err);
  });
}
