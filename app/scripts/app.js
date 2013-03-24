"use strict";

var app = angular.module("app", ["ngResource"])
  .constant("Config", {
    "APP_ID": "269152071774",
    "CLIENT_ID": "269152071774.apps.googleusercontent.com",
    "MIMETYPE": "application/vnd.google-apps.drive-sdk.269152071774"
  })
  .constant("Events", {
    "DOCUMENT_LOADED": "easi18nDocumentLoaded"
  })
  .config(["$routeProvider", function ($routeProvider) {
    $routeProvider
      .when("/", {
        templateUrl: "views/home.html",
        controller: "IndexCtrl"
      })
      .otherwise({
        redirectTo: "/"
      });
  }]);

app.controller("AppCtrl", ["$scope", "Events", function ($scope, Events) {
  $scope.data = {
    projectName: ""
  };

  $scope.$on(Events.DOCUMENT_LOADED, function (event, document, meta) {
    $scope.data.projectName = meta.title;
    $scope.$apply();
  });
}]);

app.controller("IndexCtrl", ["$scope", "Config", "Events", function ($scope, Config, Events) {
  $scope.document = null;
  $scope.meta = null;
  $scope.data = {
    collaborators: []
  };

  var fn = {};

  var ui = {
    newProjectSelector: "#newProject",
    openProjectSelector: "#openProject",
    shareProjectSelector: "#shareProjectButton",
    projectNameSelector: "#projectName",
    collaboratorsSelector: "#collaborators"
  };

  var collaborators = {
    onCollaboratorJoined: function () {
      $scope.collaborators.update();
    },
    onCollaboratorLeft: function () {
      $scope.collaborators.update();
    },
    update: function () {
      $scope.data.collaborators = $scope.document.getCollaborators();
      $scope.$apply($scope.data.collaborators);
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
  fn.initializeModel = function (model) {
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
  fn.onFileLoaded = function (doc) {
    console.log("onFileLoad");

    $scope.document = doc;
    collaborators.update();

    $scope.document.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, collaborators.onCollaboratorJoined);
    $scope.document.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, collaborators.onCollaboratorLeft);

    rtclient.getFileMetadata(null, function (m) {
      $scope.meta = m;
      $scope.$emit(Events.DOCUMENT_LOADED, $scope.document, $scope.meta);
    });

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

  // Called when a file has been selected using the Google Picker.
  fn.openCallback = function (data) {
    if (data.action === google.picker.Action.PICKED) {
      var fileId = data.docs[0].id;
      rtclient.redirectTo(fileId, $scope.realtimeLoader.authorizer.userId);
    }
  };

  // Opens the Google Picker.
  fn.popupOpen = function () {
    var token = gapi.auth.getToken().access_token;
    var view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes(Config.MIMETYPE);

    var picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setAppId(Config.APP_ID)
      .setOAuthToken(token)
      .addView(view)
      .addView(new google.picker.DocsUploadView())
      .setCallback(fn.openCallback)
      .build();
    picker.setVisible(true);
  };

  // Popups the Sharing dialog.
  fn.popupShare = function () {
    var shareClient = new gapi.drive.share.ShareClient(Config.APP_ID);
    shareClient.setItemIds([rtclient.params.fileId]);
    shareClient.showSettingsDialog();
  };

  fn.connectUi = function () {
    $(ui.openProjectSelector).click(fn.popupOpen);
    $(ui.shareProjectSelector).click(fn.popupShare);

    $("#modalCreateProject").on("click", ".btn-primary", function () {
      var fileName = $("#modalCreateProject input").val();
      $scope.realtimeLoader.createNewFileAndRedirect(fileName);
    });
  };

  /**
   * Options for the Realtime loader.
   */
  $scope.options = {
    appId: Config.APP_ID,

    /**
     * Client ID from the APIs Console.
     */
    clientId: Config.CLIENT_ID,

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
    initializeModel: fn.initializeModel,

    /**
     * Function to be called every time a Realtime file is loaded.
     */
    onFileLoaded: fn.onFileLoaded
  };

  /**
   * Start the Realtime loader with the options.
   */
  $scope.start = function () {
    $scope.realtimeLoader = new rtclient.RealtimeLoader($scope.options);
    fn.connectUi();
    console.log("Start realtime loader");
    $scope.realtimeLoader.start();
  };

  // Bootstrap the application
  google.load("picker", "1", {"callback" : $scope.start});
}]);
