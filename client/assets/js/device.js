(function() {

  // device orientation - default to portrait
  var isLandscape = false;
  var isRotatedClockwise = false;

  // device el
  var device = document.querySelector('.Device');

  // name form els
  var form = document.querySelector(".Name");
  var formInput = document.querySelector(".Name-input");
  var formButton = document.querySelector(".Name-button");

  // debug els
  var debugEl = document.querySelector('.Debug');
  var debugAlphaEl = document.querySelector('.Debug-value--alpha');
  var debugBetaEl = document.querySelector('.Debug-value--beta');
  var debugGammaEl = document.querySelector('.Debug-value--gamma');
  var debugAlphaModifiedEl = document.querySelector('.Debug-value--alphaModified');
  var debugBetaModifiedEl = document.querySelector('.Debug-value--betaModified');
  var debugGammaModifiedEl = document.querySelector('.Debug-value--gammaModified');

  // socket io connection
  var socket = window.io ? io('/device') : null;

  // reduce number of orientation events sent to websockets
  var debounceDeviceOrientationEvent = debounce(handleDeviceorientationEvent, 10);

  // init
  function init() {
    formInput.focus();
    calculateDeviceOrientation();
    form.addEventListener("submit", saveName);
    device.addEventListener("transitionend", initWebsockets);
    window.addEventListener('orientationchange', handleOrientationChange);
  }

  // recalculate values based on major device rotation
  // (e.g. landscape to portrait or vice versa)
  // allow time for the screen layout to readjust first
  function handleOrientationChange() {
    setTimeout(function() {
      calculateDeviceOrientation();
    }, 500);
  }

  // calculate whether the device is landscape or portrait
  function calculateDeviceOrientation(e) {
    isLandscape =
      document.documentElement.clientHeight < document.documentElement.clientWidth;
    isRotatedClockwise = window.orientation === -90;
  }

  // save name on form submit
  // kick off animation
  function saveName(e) {
    e.preventDefault();
    var name = formInput.value.trim();
    if (name.length > 0) {
      device.classList.add('hasName');
      debugEl.classList.add('isDisplayed');
      formButton.disabled = true;
      formInput.readOnly = true;
      socket.emit("name", name);
    }
  }

  // init websockets on css transition end
  function initWebsockets() {
    device.classList.add('hasInited');
    window.addEventListener("deviceorientation", debounceDeviceOrientationEvent);
  }

  // update display on device orientation
  function handleDeviceorientationEvent(e) {
    var alpha = normaliseAlpha(e);
    var beta = normaliseBeta(e);
    var gamma = normaliseGamma(e);

    emit(alpha, beta, gamma);
    render(alpha, beta, gamma);
    debug(alpha, beta, gamma, e);
  }

  function emit(alpha, beta, gamma) {
    if (socket) {
      socket.emit("orientation", {
        alpha: alpha,
        beta: beta,
        gamma: gamma
      });
    }
  }

  // update device
  function render(alpha, beta, gamma) {
    device.style.transform =
    "rotateX(" + beta + "deg) " +
    "rotateY(" + gamma + "deg) " +
    "rotateZ(" + alpha + "deg)";
  }

  function normaliseAlpha(e) {
    var alpha;
    if (!isLandscape) {
      if (e.beta > 90) {
        alpha = e.alpha - 90;
      } else {
        alpha = -e.alpha + 90;
      }
    } else {
      if (isRotatedClockwise) {
        if (Math.abs(e.beta) > 90) {
          alpha = e.alpha;
        } else {
          alpha = -e.alpha;
        }
      } else {
        if (Math.abs(e.beta) > 90) {
          alpha = e.alpha;
        } else {
          alpha = -e.alpha;
        }
      }
    }
    return alpha;
  }

  function normaliseBeta(e) {
    var beta;
    if (!isLandscape) {
      beta = (-e.beta + 90);
    } else {
      if (isRotatedClockwise) {
        beta = (-e.gamma + 90);
      } else {
        beta = 90 + e.gamma;
      }
    }
    return beta;
  }

  function normaliseGamma(e) {
    var gamma;
    if (!isLandscape) {
      gamma = e.gamma;
    } else {
      if (isRotatedClockwise) {
        if (Math.abs(e.beta) > 90) {
          gamma = e.beta;
        } else {
          gamma = (-e.beta);
        }
      } else {
        if (Math.abs(e.beta) > 90) {
          gamma = (-e.beta);
        } else {
          gamma = e.beta;
        }
      }
    }
    return gamma;
  }

  function debug(alpha, beta, gamma, e) {
    debugAlphaEl.textContent = Math.round(e.alpha);
    debugBetaEl.textContent = Math.round(e.beta);
    debugGammaEl.textContent = Math.round(e.gamma);
    debugAlphaModifiedEl.textContent = Math.round(alpha);
    debugBetaModifiedEl.textContent = Math.round(beta);
    debugGammaModifiedEl.textContent = Math.round(gamma);
  }

  // https://davidwalsh.name/javascript-debounce-function
  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  init();

})();
