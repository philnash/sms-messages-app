"use strict";

// npm modules
const router = require('express').Router();
const webPush = require('web-push');

// application requires
const config = require("../config");

let endpoint;
webPush.setGCMAPIKey(config.gcmAPIKey);

router.post("/subscription", function(req, res, next) {
  endpoint = req.body.endpoint;
  console.log(endpoint);
  res.sendStatus(200);
});

router.post("/twilio", function(req, res, next) {
  let message = {
    from: req.body.From,
    body: req.body.Body
  };
  if (endpoint) {
    webPush.sendNotification(endpoint).then(console.log).catch(console.log);
  }
  res.status(200).send('<Response/>');
});

module.exports = router;
