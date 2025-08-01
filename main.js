/*
 * Kids Fun Learning Adventures – unified client-side logic
 *
 * This script powers all of the activity pages (math, drawing, imagination,
 * story and report). It stores basic usage metrics in localStorage so that
 * parents can see how their child engages with each activity. The math
 * module uses visual counting with stars to help children learn arithmetic.
 * The drawing module lets children sketch with the mouse and download their
 * artwork. Imagination and story modules provide simple choices that build
 * a creative tale without relying on external APIs. A simple report page
 * summarises activity metrics using Chart.js.
 */

// Key used for storing metrics in localStorage
const METRICS_KEY = 'kidsFunMetrics';

// Retrieve stored metrics or return an empty object
function loadMetrics() {
  const raw = localStorage.getItem(METRICS_KEY);
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Save metrics object to localStorage
function saveMetrics(metrics) {
  localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
}

// Increment a counter metric
function incrementMetric(name) {
  const m = loadMetrics();
  m[name] = (m[name] || 0) + 1;
  saveMetrics(m);
  return m[name];
}

// Add seconds to a duration metric
function addDurationMetric(name, seconds) {
  const m = loadMetrics();
  m[name] = (m[name] || 0) + seconds;
  saveMetrics(m);
  return m[name];
}

/**
 * Initialise the math adventure page. Generates random arithmetic problems
 * and renders star icons for each operand. Children choose a difficulty and
 * answer problems; their performance is stored in localStorage.
 */
function initMathPage() {
  const qEl = document.getElementById('math-question');
  const visualEl = document.getElementById('visual-question');
  const ansEl = document.getElementById('math-answer');
  const checkBtn = document.getElementById('math-check');
  const feedbackEl = document.getElementById('math-feedback');
  const diffSelect = document.getElementById('math-difficulty');
  const scoreCorrect = document.getElementById('math-correct');
  const scoreAttempts = document.getElementById('math-attempts');

  if (!qEl || !visualEl || !ansEl || !checkBtn || !diffSelect) return;

  let currentAnswer;

  // Update scoreboard display from metrics
  function updateScoreboard() {
    const m = loadMetrics();
    scoreAttempts.textContent = m.mathAttempts || 0;
    scoreCorrect.textContent = m.mathCorrect || 0;
  }

  // Render stars for a given number
  function renderStars(count) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement('span');
      star.textContent = '★';
      star.style.color = '#ffcc00';
      star.style.fontSize = '1.5rem';
      star.style.marginRight = '0.2rem';
      fragment.appendChild(star);
    }
    return fragment;
  }

  // Generate a new problem based on selected difficulty
  function generate() {
    const diff = diffSelect.value;
    let a = 0;
    let b = 0;
    let op = '+';
    if (diff === 'easy') {
      op = Math.random() < 0.5 ? '+' : '-';
      a = Math.floor(Math.random() * 6) + 1; // 1-6
      b = Math.floor(Math.random() * 6) + 1;
      if (op === '-' && b > a) [a, b] = [b, a];
    } else if (diff === 'medium') {
      op = Math.random() < 0.7 ? (Math.random() < 0.5 ? '+' : '-') : '×';
      if (op === '×') {
        a = Math.floor(Math.random() * 6) + 1;
        b = Math.floor(Math.random() * 6) + 1;
      } else {
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
        if (op === '-' && b > a) [a, b] = [b, a];
      }
    } else {
      op = Math.random() < 0.5 ? (Math.random() < 0.5 ? '+' : '-') : '×';
      if (op === '×') {
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
      } else {
        a = Math.floor(Math.random() * 21);
        b = Math.floor(Math.random() * 21);
        if (op === '-' && b > a) [a, b] = [b, a];
      }
    }
    // Compute answer
    if (op === '+') currentAnswer = a + b;
    else if (op === '-') currentAnswer = a - b;
    else currentAnswer = a * b;
    // Update question text
    qEl.textContent = `${a} ${op} ${b} = ?`;
    // Render visual representation
    visualEl.innerHTML = '';
    visualEl.appendChild(renderStars(a));
    const opSpan = document.createElement('span');
    opSpan.textContent = ` ${op} `;
    opSpan.style.margin = '0 0.5rem';
    visualEl.appendChild(opSpan);
    visualEl.appendChild(renderStars(b));
    ansEl.value = '';
    feedbackEl.textContent = '';
  }

  // Handle answer submission
  checkBtn.addEventListener('click', () => {
    const val = parseInt(ansEl.value, 10);
    const metrics = loadMetrics();
    metrics.mathAttempts = (metrics.mathAttempts || 0) + 1;
    if (!isNaN(val) && val === currentAnswer) {
      feedbackEl.textContent = 'Great job! That’s correct!';
      feedbackEl.style.color = '#006400';
      metrics.mathCorrect = (metrics.mathCorrect || 0) + 1;
    } else {
      feedbackEl.textContent = `Oops! The correct answer was ${currentAnswer}. Try another!`;
      feedbackEl.style.color = '#b30000';
    }
    saveMetrics(metrics);
    updateScoreboard();
    setTimeout(generate, 1500);
  });
  diffSelect.addEventListener('change', generate);
  // Initialise scoreboard and first problem
  updateScoreboard();
  generate();
}

/**
 * Initialise the drawing studio. Sets up a canvas for freehand drawing
 * with a simple colour palette and stroke size. Provides clear and
 * download buttons. Metrics track time spent drawing.
 */
function initDrawingPage() {
  const canvas = document.getElementById('drawing-canvas');
  const ctx = canvas.getContext('2d');
  const clearBtn = document.getElementById('drawing-clear');
  const downloadBtn = document.getElementById('drawing-download');
  const colourPicker = document.getElementById('drawing-colour');
  const sizePicker = document.getElementById('drawing-size');
  if (!canvas || !ctx) return;
  // Resize canvas to fit container
  canvas.width = canvas.offsetWidth;
  canvas.height = 400;
  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  const startTime = Date.now();
  function startDraw(e) {
    drawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
  function draw(e) {
    if (!drawing) return;
    ctx.strokeStyle = colourPicker.value;
    ctx.lineWidth = parseInt(sizePicker.value, 10);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
  function endDraw() {
    drawing = false;
  }
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  // Clear canvas
  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
  // Download canvas as PNG
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'my-drawing.png';
    link.click();
  });
  // Track time spent drawing
  window.addEventListener('beforeunload', () => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    addDurationMetric('drawingTime', seconds);
  });
}

/**
 * Initialise the imagination explorer. Lets children pick a character,
 * setting and activity, then displays the choices. Metrics track
 * selections.
 */
function initImaginationPage() {
  const charBtns = document.querySelectorAll('#characters button');
  const settingBtns = document.querySelectorAll('#settings button');
  const activityBtns = document.querySelectorAll('#activities button');
  const outputEl = document.getElementById('imagination-result');
  let selectedChar, selectedSetting, selectedActivity;

  function selectOption(btns, type) {
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Deselect others
        btns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        if (type === 'character') selectedChar = btn.textContent;
        if (type === 'setting') selectedSetting = btn.textContent;
        if (type === 'activity') selectedActivity = btn.textContent;
        if (selectedChar && selectedSetting && selectedActivity) {
          // Record selection metrics
          const m = loadMetrics();
          m.imaginationSelections = (m.imaginationSelections || 0) + 1;
          saveMetrics(m);
          outputEl.textContent = `Imagine a ${selectedChar} in a ${selectedSetting} who loves to ${selectedActivity}!`;
        }
      });
    });
  }
  selectOption(charBtns, 'character');
  selectOption(settingBtns, 'setting');
  selectOption(activityBtns, 'activity');
}

/**
 * Initialise the story builder. Allows children to make a series of
 * selections and then generates a simple narrative based on those choices.
 */
function initStoryPage() {
  const container = document.getElementById('story-builder');
  const textEl = document.getElementById('story-text');
  const optionsEl = document.getElementById('story-options');
  if (!container || !textEl || !optionsEl) return;

  const steps = [
    {
      title: 'Choose a hero',
      options: ['Brave Dragon', 'Sparkly Unicorn', 'Friendly Robot', 'Curious Fairy']
    },
    {
      title: 'Choose a sidekick',
      options: ['Clever Fox', 'Cheerful Monkey', 'Daring Puppy', 'Wise Owl']
    },
    {
      title: 'Choose a setting',
      options: ['Enchanted Forest', 'Deep Space', 'Coral Reef', 'Crystal Castle']
    },
    {
      title: 'Choose a mission',
      options: ['Find hidden treasure', 'Rescue a friend', 'Solve a mystery', 'Throw a party']
    }
  ];
  let currentStep = 0;
  const selections = [];

  function renderStep() {
    const step = steps[currentStep];
    textEl.textContent = step.title;
    optionsEl.innerHTML = '';
    step.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        selections[currentStep] = opt;
        currentStep++;
        if (currentStep < steps.length) {
          renderStep();
        } else {
          finishStory();
        }
      });
      optionsEl.appendChild(btn);
    });
  }

  function finishStory() {
    // Record metric
    incrementMetric('stories');
    const [hero, sidekick, setting, mission] = selections;
    container.innerHTML = `<p>Your story: In the ${setting}, ${hero} and their friend ${sidekick} decide to ${mission.toLowerCase()}. What an adventure!</p>`;
  }
  renderStep();
}

/**
 * Initialise the report page. Displays metrics from localStorage and
 * draws a simple bar chart using Chart.js.
 */
function initReportPage() {
  const tableBody = document.getElementById('report-table-body');
  const chartContainer = document.getElementById('report-chart');
  const metrics = loadMetrics();
  if (tableBody) {
    tableBody.innerHTML = '';
    Object.keys(metrics).forEach(key => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      nameCell.textContent = key;
      const valueCell = document.createElement('td');
      valueCell.textContent = metrics[key];
      row.appendChild(nameCell);
      row.appendChild(valueCell);
      tableBody.appendChild(row);
    });
  }
  // Draw bar chart if Chart.js is loaded
  if (chartContainer && typeof Chart !== 'undefined') {
    const ctx = document.getElementById('reportChartCanvas').getContext('2d');
    const labels = Object.keys(metrics);
    const data = Object.values(metrics);
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Activity Metrics',
            data,
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

// Initialise the appropriate page after DOM ready or immediately if already loaded
function initialisePage() {
  const page = document.body.dataset.page;
  switch (page) {
    case 'math':
      initMathPage();
      break;
    case 'drawing':
      initDrawingPage();
      break;
    case 'imagination':
      initImaginationPage();
      break;
    case 'story':
      initStoryPage();
      break;
    case 'report':
      initReportPage();
      break;
    default:
      break;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialisePage);
} else {
  initialisePage();
}