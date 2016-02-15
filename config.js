"use strict";

try {
  require('dotenv').config();
} catch(e) {
  // Dotenv not loaded, we're in production mode.
}


module.exports = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER
}
