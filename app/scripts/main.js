require.config({
  paths: {
    jquery: "../components/jquery/jquery",
    bootstrap: "vendor/bootstrap",
    google: "vendor/google/google",
    gapi: "vendor/google/gapi",
    rtclient: "vendor/google/realtime-client-utils"
  },
  shim: {
    bootstrap: {
      deps: ["jquery"],
      exports: "jquery"
    },
    rtclient: {
      deps: ["gapi"],
      exports: "rtclient"
    },
    app: {
      deps: ["jquery", "google", "gapi", "rtclient"],
      exports: "app"
    }
  }
});

require(["jquery", "bootstrap", "google", "gapi", "rtclient", "app"], function ($, bs, google, gapi, rtclient, app) {
  "use strict";
  console.log(app);
  // Load Drive picker and then start the application
  google.load("picker", "1", {"callback" : app.start});
});