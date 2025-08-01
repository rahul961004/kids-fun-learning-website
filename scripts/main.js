// Proxy script to maintain directory structure on GitHub Pages
// This file lives in the `scripts` directory and is referenced by the
// HTML pages. It dynamically loads the root-level `main.js` which contains
// all of the activity logic. Once the script has loaded, it explicitly
// invokes the appropriate initialisation function in case the
// `DOMContentLoaded` event has already fired.

(() => {
  // Create a new script element to load the root script
  const script = document.createElement('script');
  script.src = '../main.js';
  script.onload = () => {
    // Determine which page we're on via the data-page attribute
    const page = document.body.dataset.page;
    try {
      switch (page) {
        case 'math':
          if (typeof window.initMathPage === 'function') window.initMathPage();
          break;
        case 'drawing':
          if (typeof window.initDrawingPage === 'function') window.initDrawingPage();
          break;
        case 'imagination':
          if (typeof window.initImaginationPage === 'function') window.initImaginationPage();
          break;
        case 'story':
          if (typeof window.initStoryPage === 'function') window.initStoryPage();
          break;
        case 'report':
          if (typeof window.initReportPage === 'function') window.initReportPage();
          break;
        default:
          // No specific initialisation for the home page
          break;
      }
    } catch (err) {
      console.error('Failed to initialise page after loading main.js:', err);
    }
  };
  document.head.appendChild(script);
})();