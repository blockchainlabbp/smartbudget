// Import the page's CSS. Webpack will know what to do with it.
var app = require("./app.js");

/**
 * Tasks to do on page load
 * Always start with window.App.start(), this is where the shared logic resides
 */
window.addEventListener('load', async function() {
  await window.App.start();
});

