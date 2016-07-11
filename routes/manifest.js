"use strict";

// npm modules
const router = require('express').Router();

// application requires
const config = require("../config");

router.get("/manifest.json", function(req, res, next) {
  res.setHeader("Content-Type", "application/json");
  res.render("manifest", {
    gcmSenderId: config.gcmSenderId,
    layout: false
  });
});

module.exports = router;
