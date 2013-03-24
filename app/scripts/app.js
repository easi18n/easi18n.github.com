/*global define */
define(["lodash", "gapi", "google", "rtclient"], function (_, gapi, google, rtclient) {
  "use strict";

  var app = app || {};
  app.APP_ID = "269152071774";
  app.CLIENT_ID = "269152071774.apps.googleusercontent.com";
  app.MIMETYPE = "application/vnd.google-apps.drive-sdk." + app.APP_ID;

  app.document = null;
  app.meta = null;

  app.ui = {
    newProjectSelector: "#newProject",
    openProjectSelector: "#openProject",
    shareProjectSelector: "#shareProjectButton",
    projectNameSelector: "#projectName",
    collaboratorsSelector: "#collaborators",

    updateProjectName: function () {
      if (app.meta) {
        $(app.ui.projectNameSelector).text(" / " + app.meta.title);
      }
    },

    updateCollaborators: function () {
      if (app.document) {
        $(app.ui.collaboratorsSelector).children().remove();
        _.forEach(app.document.getCollaborators(), function (collaborator) {
          console.log(collaborator);
          var isYou = collaborator.isMe ? " (you)" : "";
          var li = '<li><i class="icon-user" style="color:' + collaborator.color + ';"></i> ' + collaborator.displayName + isYou + '</li>';
          $(app.ui.collaboratorsSelector).append(li);
        });
      }
    }
  };

  app.collaborators = {
    onCollaboratorJoined: function () {
      app.ui.updateCollaborators();
    },
    onCollaboratorLeft: function () {
      app.ui.updateCollaborators();
    }
  };

  /**
   * This function is called the first time that the Realtime model is created
   * for a file. This function should be used to initialize any values of the
   * model. In this case, we just create the single string model that will be
   * used to control our text box. The string has a starting value of 'Hello
   * Realtime World!', and is named 'text'.
   * @param model {gapi.drive.realtime.Model} the Realtime root model object.
   */
  app.initializeModel = function (model) {
    var string = model.createString("New project content");
    model.getRoot().set("text", string);
  };

  /**
   * This function is called when the Realtime file has been loaded. It should
   * be used to initialize any user interface components and event handlers
   * depending on the Realtime model. In this case, create a text control binder
   * and bind it to our string model that we created in initializeModel.
   * @param doc {gapi.drive.realtime.Document} the Realtime document.
   */
  app.onFileLoaded = function (doc) {
    console.log("onFileLoad");

    app.document = doc;
    rtclient.getFileMetadata(null, function (m) {
      app.meta = m;
      app.ui.updateProjectName();
    });

    app.document.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, app.collaborators.onCollaboratorJoined);
    app.document.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, app.collaborators.onCollaboratorLeft);
    app.ui.updateCollaborators();

    var string = doc.getModel().getRoot().get("text");

    // Keeping one box updated with a String binder.
    var textArea1 = document.getElementById("editor1");
    gapi.drive.realtime.databinding.bindString(string, textArea1);

    // Keeping one box updated with a custom EventListener.
    var textArea2 = document.getElementById("editor2");
    var updateTextArea2 = function () {
      textArea2.value = string;
    };
    string.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, updateTextArea2);
    string.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, updateTextArea2);
    textArea2.onkeyup = function () {
      string.setText(textArea2.value);
    };
    updateTextArea2();

    // Enabling UI Elements.
    textArea1.disabled = false;
    textArea2.disabled = false;
  };

  // Opens the Google Picker.
  app.popupOpen = function () {
    var token = gapi.auth.getToken().access_token;
    var view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes(app.MIMETYPE);

    var picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setAppId(app.APP_ID)
      .setOAuthToken(token)
      .addView(view)
      .addView(new google.picker.DocsUploadView())
      .setCallback(app.openCallback)
      .build();
    picker.setVisible(true);
  };

  // Called when a file has been selected using the Google Picker.
  app.openCallback = function (data) {
    if (data.action === google.picker.Action.PICKED) {
      var fileId = data.docs[0].id;
      rtclient.redirectTo(fileId, app.realtimeLoader.authorizer.userId);
    }
  };

  // Popups the Sharing dialog.
  app.popupShare = function () {
    var shareClient = new gapi.drive.share.ShareClient(app.APP_ID);
    shareClient.setItemIds([rtclient.params.fileId]);
    shareClient.showSettingsDialog();
  };

  app.connectUi = function () {
    $(app.ui.openProjectSelector).click(app.popupOpen);
    $(app.ui.shareProjectSelector).click(app.popupShare);

    $("#modalCreateProject").on("click", ".btn-primary", function () {
      var fileName = $("#modalCreateProject input").val();
      console.log(fileName);
      app.realtimeLoader.createNewFileAndRedirect(fileName);
    });
  };

  /**
   * Options for the Realtime loader.
   */
  app.options = {
    appId: app.APP_ID,

    /**
     * Client ID from the APIs Console.
     */
    clientId: app.CLIENT_ID,

    /**
     * The ID of the button to click to authorize. Must be a DOM element ID.
     */
    authButtonElementId: "authorizeButton",

    /**
     * Autocreate files right after auth automatically.
     */
    autoCreate: true,

    /**
     * Autocreate files right after auth automatically.
     */
    defaultTitle: "New Project",

    /**
     * Function to be called when a Realtime model is first created.
     */
    initializeModel: app.initializeModel,

    /**
     * Function to be called every time a Realtime file is loaded.
     */
    onFileLoaded: app.onFileLoaded
  };

  /**
   * Start the Realtime loader with the options.
   */
  app.start = function () {
    app.realtimeLoader = new rtclient.RealtimeLoader(app.options);
    app.connectUi();
    console.log("Start realtime loader");
    app.realtimeLoader.start();
  };

  return app;
});