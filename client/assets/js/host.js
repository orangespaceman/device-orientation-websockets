(function() {

  // handle sockets
  var socket = io("/host");
  socket.on("add", addScene);
  socket.on("orientation", updateScene);
  socket.on("remove", removeScene);

  // content node to add scenes to
  var wrapperEl = document.querySelector(".Wrapper");

  // scene template to duplicate
  var sceneTemplateEl = document.querySelector(".Scene");

  // object containing all active scenes
  var scenes = {};

  function addScene(data) {
    scenes[data.id] = {};

    var sceneEl = sceneTemplateEl.cloneNode(true);
    sceneEl.classList.remove("isTemplate");
    wrapperEl.appendChild(sceneEl);
    scenes[data.id].sceneEl = sceneEl;

    var deviceEl = sceneEl.querySelector(".Device");
    scenes[data.id].deviceEl = deviceEl;

    var nameEl = sceneEl.querySelector(".NameText");
    nameEl.textContent = data.name;
  }

  function updateScene(data) {
    if (scenes[data.id]) {
      var deviceEl = scenes[data.id].deviceEl;
      deviceEl.style.transform =
        "rotateX(" + data.orientation.beta + "deg) " +
        "rotateY(" + data.orientation.gamma + "deg) " +
        "rotateZ(" + data.orientation.alpha + "deg)";
    }
  }

  function removeScene(data) {
    if (scenes[data.id]) {
      wrapperEl.removeChild(scenes[data.id].sceneEl);
      delete scenes[data.id];
    }
  }

})();