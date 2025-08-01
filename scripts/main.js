// Proxy script to maintain directory structure
// Dynamically load the main script from the project root
(function() {
  var script = document.createElement('script');
  // Load root-level main.js which contains all activity logic
  script.src = '../main.js';
  document.head.appendChild(script);
})();
