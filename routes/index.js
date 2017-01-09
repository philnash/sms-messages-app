"use strict";

// npm modules
const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const values = require('object.values');

// application requires
const config = require("../config");

const client = twilio(config.accountSid, config.authToken);

router.get("/", function(req, res, next) {
  client.messages.list({to: config.phoneNumber}).then(function(data) {
    let messages = data.messages;
    messages = messages.reduce(function(accumulator, currentMessage){
      if(!accumulator[currentMessage.from]) {
        accumulator[currentMessage.from] = currentMessage;
      }
      return accumulator;
    }, {});
    messages = values(messages);
    res.render('index', {
      messages: messages,
      title: "Inbox"
    });
  });
});

router.get("/outbox", function(req, res, next) {
  client.messages.list({from: config.phoneNumber}).then(function(data) {
    let messages = data.messages;
    messages = messages.reduce(function(accumulator, currentMessage){
      if(!accumulator[currentMessage.to]) {
        accumulator[currentMessage.to] = currentMessage;
      }
      return accumulator;
    }, {});
    messages = values(messages);
    res.render('outbox', {
      messages: messages,
      title: "Outbox"
    });
  });
});

router.get("/messages/new", function(req, res, next) {
  res.render("new", {
    title: "New message"
  });
});

router.post("/messages", function(req, res, next) {
  client.messages.create({
    from: config.phoneNumber,
    to: req.body.phoneNumber,
    body: req.body.body
  }).then(function(data) {
    if (req.xhr) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ result: "success" }));
    } else {
      res.redirect("/messages/"+req.body.phoneNumber+"#"+data.sid);
    }
  }).catch(function(err) {
    if (req.xhr) {
      res.setHeader('Content-Type', 'application/json');
      res.status(err.status).send(JSON.stringify(err));
    } else {
      res.redirect(req.header('Referer') || '/');
    }
  });
});

router.get("/messages/:phoneNumber", function(req, res, next) {
  let incoming = client.messages.list({
    from: req.params.phoneNumber,
    to: config.phoneNumber
  });
  let outgoing = client.messages.list({
    from: config.phoneNumber,
    to: req.params.phoneNumber
  });
  Promise.all([incoming, outgoing]).then(function(values) {
    var allMessages = values[0].messages.concat(values[1].messages);
    allMessages.sort(function(a, b){
      let date1 = Date.parse(a.dateCreated);
      let date2 = Date.parse(b.dateCreated);
      if (date1 == date2) { return 0; }
      else { return date1 < date2 ? -1 : 1 }
    });
    allMessages = allMessages.map(function(message){
      message.isInbound = message.direction === "inbound";
      message.isOutbound = message.direction.startsWith("outbound");
      return message;
    });
    res.render("show", {
      messages: allMessages,
      phoneNumber: req.params.phoneNumber,
      bodyClass: "messages",
      title: req.params.phoneNumber
    });
  });
});

module.exports = router;
