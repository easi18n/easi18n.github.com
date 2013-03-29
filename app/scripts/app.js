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
  }])
  .config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(true);
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
    projectName: "",
    collaborators: [],
    messages: [],
    langs: [],
    newKey: "",
    newLang: ""
  };

  var fn = {
    apply: function (item) {
      if (!$scope.$$phase) {
        $scope.$apply(item);
      }
    }
  };

  $scope.hasDocument = function () {
    return !!$scope.document;
  };

  $scope.addKey = function () {
    fn.getMessagesField().set($scope.data.newKey, "");
    $scope.data.newKey = "";
  };

  $scope.deleteKey = function (key) {
    fn.getMessagesField().delete(key);
  };

  $scope.onMessageChange = function (index) {
    messages.update(index);
  };

  $scope.addLang = function () {
    var newLang = $scope.data.newLang;
    if (fn.getLangsField().lastIndexOf(newLang) < 0) {
      fn.getLangsField().push(newLang);
      $scope.data.newLang = "";
    }
  };

  $scope.removeLang = function (index) {
    fn.getLangsField().remove(index);
  };

  $scope.updateProjectName = function () {
    gapi.client.load("drive", "v2", function () {
      gapi.client.drive.files.patch({
        "fileId": $scope.meta.id,
        "resource": {
          "title": $scope.data.projectName
        }
      }).execute(function () {rtclient.redirectTo($scope.meta.id); });
    });
  };

  var fields = {
    MESSAGES_MAP: "messages",
    LANGS_LIST: "langs"
  };

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
      fn.apply($scope.data.collaborators);
    }
  };

  var messages = {
    timer: 0,
    onValueChange: function () {
      messages.updateUi();
    },
    update: function (index) {
      clearTimeout(messages.timer);
      messages.timer = setTimeout(function () {
        fn.getMessagesField().set($scope.data.messages[index][0], $scope.data.messages[index][1]);
      }, 1000);
    },
    updateUi: function () {
      $scope.data.messages = fn.getMessagesField().items();
      fn.apply($scope.data.messages);
    }
  };

  var langs = {
    updateUi: function () {
      $scope.data.langs = fn.getLangsField().asArray();
      fn.apply($scope.data.langs);
    },
    onValuesAdded: function () {
      langs.updateUi();
    },
    onValuesRemoved: function () {
      langs.updateUi();
    },
    onValuesSet: function () {
      langs.updateUi();
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
    var messagesMap = model.createMap();
    model.getRoot().set(fields.MESSAGES_MAP, messagesMap);

    var langsList = model.createList();
    model.getRoot().set(fields.LANGS_LIST, langsList);
  };

  fn.getModel = function () {
    return $scope.hasDocument() && $scope.document.getModel() || null;
  };

  fn.getRoot = function () {
    return $scope.hasDocument() && fn.getModel().getRoot() || null;
  };

  fn.getRootField = function (fieldName) {
    return $scope.hasDocument() && fn.getRoot().get(fieldName) || null;
  };

  fn.getMessagesField = function () {
    return $scope.hasDocument() && fn.getRootField(fields.MESSAGES_MAP) || null;
  };

  fn.getLangsField = function () {
    return $scope.hasDocument() && fn.getRootField(fields.LANGS_LIST) || null;
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

    rtclient.getFileMetadata(null, function (m) {
      $scope.meta = m;
      $scope.data.projectName = m.title;
      $scope.$emit(Events.DOCUMENT_LOADED, $scope.document, $scope.meta);
    });

    collaborators.update();
    $scope.document.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_JOINED, collaborators.onCollaboratorJoined);
    $scope.document.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT, collaborators.onCollaboratorLeft);

    var messagesField = fn.getMessagesField();
    $scope.data.messages = messagesField.items();
    messagesField.addEventListener(gapi.drive.realtime.EventType.VALUE_CHANGED, messages.onValueChange);

    var langsField = fn.getLangsField();
    $scope.data.langs = langsField.asArray();
    langsField.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, langs.onValuesAdded);
    langsField.addEventListener(gapi.drive.realtime.EventType.VALUES_REMOVED, langs.onValuesRemoved);
    langsField.addEventListener(gapi.drive.realtime.EventType.VALUES_SET, langs.onValuesSet);

//    gapi.drive.realtime.databinding.bindString(string, textArea1);
//    string.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, updateTextArea2);
//    string.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, updateTextArea2);
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
    autoCreate: false,

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
