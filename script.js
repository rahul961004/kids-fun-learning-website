/*
 * Kids Fun Learning Adventures – enhanced interactivity and reporting
 *
 * This script powers the interactive games (math, story, drawing and imagination)
 * and generates a simple parent report. It stores basic usage metrics in
 * localStorage so that parents can see how their child engages with each
 * activity. Improvements include variable difficulty math problems, a download
 * feature on the drawing page, additional imagination choices and a bar
 * chart summarising activity metrics on the report page.
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

// Increment a single count metric
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

// Home page – swap in our generated hero image if present
function initHomePage() {
  const heroImage = document.querySelector('.hero img');
  if (heroImage) {
    heroImage.src = 'hero.png';
  }
}

// Math Adventure – variable difficulty and scoreboard
function initMathPage() {
  const qEl = document.getElementById('math-question');
  const ansEl = document.getElementById('math-answer');
  const submitBtn = document.getElementById('math-submit');
  const resultEl = document.getElementById('math-result');
  const diffSelect = document.getElementById('difficulty');
  const scoreCorrect = document.getElementById('score-correct');
  const scoreAttempts = document.getElementById('score-attempts');
  if (!qEl || !ansEl || !submitBtn) return;
  let currentAnswer;
  // Update scoreboard display from metrics
  function updateScoreboard() {
    const m = loadMetrics();
    scoreAttempts.textContent = m.mathAttempts || 0;
    scoreCorrect.textContent = m.mathCorrect || 0;
  }
  // Generate a new problem based on selected difficulty
  function generate() {
    const diff = diffSelect.value;
    let a = 0;
    let b = 0;
    let op = '+';
    if (diff === 'easy') {
      op = Math.random() < 0.5 ? '+' : '-';
      a = Math.floor(Math.random() * 11);
      b = Math.floor(Math.random() * 11);
      if (op === '-' && b > a) [a, b] = [b, a];
      currentAnswer = op === '+' ? a + b : a - b;
      qEl.textContent = `${a} ${op} ${b} = ?`;
    } else if (diff === 'medium') {
      op = Math.random() < 0.7 ? (Math.random() < 0.5 ? '+' : '-') : '×';
      a = Math.floor(Math.random() * 51);
      b = Math.floor(Math.random() * 51);
      if (op === '-') {
        if (b > a) [a, b] = [b, a];
        currentAnswer = a - b;
      } else if (op === '+') {
        currentAnswer = a + b;
      } else {
        // simple multiplication limited to 10×10 to keep it fun
        a = Math.floor(Math.random() * 11);
        b = Math.floor(Math.random() * 11);
        currentAnswer = a * b;
      }
      qEl.textContent = `${a} ${op} ${b} = ?`;
    } else {
      // hard: include multiplication and larger numbers
      op = Math.random() < 0.5 ? (Math.random() < 0.5 ? '+' : '-') : '×';
      if (op === '+') {
        a = Math.floor(Math.random() * 101);
        b = Math.floor(Math.random() * 101);
        currentAnswer = a + b;
      } else if (op === '-') {
        a = Math.floor(Math.random() * 101);
        b = Math.floor(Math.random() * 101);
        if (b > a) [a, b] = [b, a];
        currentAnswer = a - b;
      } else {
        a = Math.floor(Math.random() * 13);
        b = Math.floor(Math.random() * 13);
        currentAnswer = a * b;
      }
      qEl.textContent = `${a} ${op} ${b} = ?`;
    }
    ansEl.value = '';
    resultEl.textContent = '';
    resultEl.style.color = '';
  }
  submitBtn.addEventListener('click', () => {
    const val = parseInt(ansEl.value, 10);
    const metrics = loadMetrics();
    metrics.mathAttempts = (metrics.mathAttempts || 0) + 1;
    if (!isNaN(val) && val === currentAnswer) {
      resultEl.textContent = 'Great job! That’s correct!';
      resultEl.style.color = '#006400';
      metrics.mathCorrect = (metrics.mathCorrect || 0) + 1;
    } else {
      resultEl.textContent = `Oops! The correct answer was ${currentAnswer}. Try another!`;
      resultEl.style.color = '#b30000';
    }
    saveMetrics(metrics);
    updateScoreboard();
    setTimeout(generate, 1500);
  });
  diffSelect.addEventListener('change', generate);
  // initialise scoreboard and first problem
  updateScoreboard();
  generate();
}

// Story Adventure – choose‑your‑own adventure with metrics
function initStoryPage() {
  const textEl = document.getElementById('story-text');
  const optionsEl = document.getElementById('story-options');
  if (!textEl || !optionsEl) return;
  // Define story nodes
  const nodes = {
    start: {
      text: 'You wake up in a magical forest. You see a friendly dragon and a sparkling river. Who will you visit first?',
      options: [
        { label: 'Visit the dragon', next: 'dragon', metric: 'storyDragon' },
        { label: 'Explore the river', next: 'river', metric: 'storyRiver' },
      ],
    },
    dragon: {
      text: 'The dragon smiles and offers you a ride through the sky! Do you hop on or ask for a treasure hunt instead?',
      options: [
        { label: 'Fly with the dragon', next: 'fly' },
        { label: 'Go on a treasure hunt', next: 'treasure' },
      ],
    },
    river: {
      text: 'At the river, a talking fish invites you to sing or splash. What do you choose?',
      options: [
        { label: 'Sing with the fish', next: 'sing' },
        { label: 'Splash in the water', next: 'splash' },
      ],
    },
    fly: {
      text: 'You soar above the clouds and land on a fluffy cloud with a cookie tree. Yum! The end.',
      options: [],
    },
    treasure: {
      text: 'You search for treasure and find a chest filled with crayons and stickers! Time to get creative. The end.',
      options: [],
    },
    sing: {
      text: 'You sing a silly song with the fish and dancing turtles join you. Everyone claps. The end.',
      options: [],
    },
    splash: {
      text: 'You splash in the sparkling river and discover colourful stones that look like jellybeans. You take some home. The end.',
      options: [],
    },
  };
  let currentId = 'start';
  function render() {
    const node = nodes[currentId];
    textEl.textContent = node.text;
    optionsEl.innerHTML = '';
    if (!node.options.length) {
      const btn = document.createElement('button');
      btn.textContent = 'Play Again';
      btn.className = 'btn-primary';
      btn.addEventListener('click', () => {
        currentId = 'start';
        render();
      });
      optionsEl.appendChild(btn);
      return;
    }
    node.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.textContent = opt.label;
      btn.className = 'btn-primary';
      btn.addEventListener('click', () => {
        if (opt.metric) incrementMetric(opt.metric);
        currentId = opt.next;
        render();
      });
      optionsEl.appendChild(btn);
    });
  }
  render();
}

// Drawing Studio – paint on a canvas, clear and download
function initDrawingPage() {
  const canvas = document.getElementById('drawing-canvas');
  const colorPicker = document.getElementById('color-picker');
  const sizeRange = document.getElementById('brush-size');
  const clearBtn = document.getElementById('clear-canvas');
  const downloadBtn = document.getElementById('download-canvas');
  if (!canvas || !colorPicker || !sizeRange) return;
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let lastX = 0;
  let lastY = 0;
  let strokeCount = 0;
  function resize() {
    const width = Math.min(600, canvas.parentElement.clientWidth);
    canvas.width = width;
    canvas.height = (width * 2) / 3;
  }
  function start(e) {
    drawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
  }
  function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = sizeRange.value;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastX = x;
    lastY = y;
    strokeCount++;
  }
  function stop() {
    drawing = false;
  }
  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my_drawing.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
  window.addEventListener('resize', resize);
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stop);
  canvas.addEventListener('mouseleave', stop);
  // Record usage when leaving page
  const startTime = Date.now();
  window.addEventListener('beforeunload', () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    addDurationMetric('drawingTime', duration);
    const m = loadMetrics();
    m.drawingStrokes = (m.drawingStrokes || 0) + strokeCount;
    saveMetrics(m);
  });
  resize();
}

// Parent Report – generate summary table, suggestions and chart
function initReportPage() {
  const container = document.getElementById('report-content');
  const canvasEl = document.getElementById('metrics-chart');
  if (!container || !canvasEl) return;
  const metrics = loadMetrics();
  // Build summary table
  let html = '<table class="report-table">';
  html += '<thead><tr><th>Activity</th><th>Metric</th><th>Value</th></tr></thead><tbody>';
  html += `<tr><td>Math</td><td>Attempts</td><td>${metrics.mathAttempts || 0}</td></tr>`;
  html += `<tr><td>Math</td><td>Correct</td><td>${metrics.mathCorrect || 0}</td></tr>`;
  html += `<tr><td>Story</td><td>Dragon choices</td><td>${metrics.storyDragon || 0}</td></tr>`;
  html += `<tr><td>Story</td><td>River choices</td><td>${metrics.storyRiver || 0}</td></tr>`;
  html += `<tr><td>Drawing</td><td>Strokes</td><td>${metrics.drawingStrokes || 0}</td></tr>`;
  html += `<tr><td>Drawing</td><td>Minutes</td><td>${Math.round((metrics.drawingTime || 0) / 60)}</td></tr>`;
  html += `<tr><td>Imagination</td><td>Stories created</td><td>${metrics.imaginationStories || 0}</td></tr>`;
  html += '</tbody></table>';
  // Suggestions
  const suggestions = [];
  const attempts = metrics.mathAttempts || 0;
  const correct = metrics.mathCorrect || 0;
  if (attempts > 0) {
    const rate = correct / attempts;
    if (rate < 0.6) suggestions.push('Practice more addition and subtraction together.');
    else suggestions.push('Great math accuracy! Introduce more challenging problems.');
  } else {
    suggestions.push('Try playing some math games to build confidence with numbers.');
  }
  if ((metrics.storyDragon || 0) > (metrics.storyRiver || 0)) {
    suggestions.push('Your child seems to prefer adventurous choices. Encourage imaginative play.');
  } else if ((metrics.storyRiver || 0) > (metrics.storyDragon || 0)) {
    suggestions.push('Your child enjoys calm and reflective choices. Offer creative storytelling time.');
  } else {
    suggestions.push('Explore both adventurous and calm story paths to see what your child enjoys.');
  }
  if ((metrics.drawingStrokes || 0) > 100 || (metrics.drawingTime || 0) > 300) {
    suggestions.push('Your child loves drawing! Provide diverse art materials to nurture creativity.');
  } else {
    suggestions.push('Encourage your child to spend more time drawing to develop fine motor skills.');
  }
  // Imagination preferences
  const charCounts = {
    dragon: metrics.imaginationCharacter_dragon || 0,
    robot: metrics.imaginationCharacter_robot || 0,
    unicorn: metrics.imaginationCharacter_unicorn || 0,
    fairy: metrics.imaginationCharacter_fairy || 0,
  };
  const topChar = Object.keys(charCounts).reduce((a, b) => (charCounts[a] > charCounts[b] ? a : b));
  if (metrics.imaginationStories) {
    if (topChar === 'unicorn') {
      suggestions.push('Your child enjoys magical creatures. Offer fantasy books and imaginative play.');
    } else if (topChar === 'dragon') {
      suggestions.push('Your child loves adventure and mythical beings. Encourage storytelling and creative games.');
    } else if (topChar === 'robot') {
      suggestions.push('Your child is drawn to robots and technology. Explore STEM toys and science activities.');
    } else if (topChar === 'fairy') {
      suggestions.push('Your child loves fairies and wonder. Read fairy tales and create whimsical crafts together.');
    }
  }
  html += `<p><strong>Suggestions:</strong> ${suggestions.join(' ')}</p>`;
  container.innerHTML = html;
  // Build bar chart using Chart.js
  const labels = [
    'Math Correct',
    'Math Attempts',
    'Story Dragon',
    'Story River',
    'Drawing Strokes',
    'Drawing Minutes',
    'Imagination Stories',
  ];
  const data = [
    metrics.mathCorrect || 0,
    metrics.mathAttempts || 0,
    metrics.storyDragon || 0,
    metrics.storyRiver || 0,
    metrics.drawingStrokes || 0,
    Math.round((metrics.drawingTime || 0) / 60),
    metrics.imaginationStories || 0,
  ];
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Activity Metrics',
        data,
        backgroundColor: [
          '#8e24aa',
          '#d81b60',
          '#43a047',
          '#039be5',
          '#fb8c00',
          '#fdd835',
          '#5e35b1',
        ],
      },
    ],
  };
  const ctx = canvasEl.getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: {
      responsive: true,
      scales: {
        x: {
          title: { display: false },
        },
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  });
  // AI insights generation reused from original script
  const btn = document.getElementById('generate-insights-btn');
  async function getEnvKey() {
    try {
      const response = await fetch('.env');
      if (!response.ok) return null;
      const text = await response.text();
      const match = text.match(/OPENAI_API_KEY\s*=\s*(.+)/);
      return match ? match[1].trim() : null;
    } catch {
      return null;
    }
  }
  if (btn) {
    btn.addEventListener('click', async () => {
      const inputKey = document.getElementById('api-key-input').value.trim();
      let keyVal = inputKey;
      if (!keyVal) {
        keyVal = await getEnvKey();
      }
      if (!keyVal) {
        alert('Please enter your OpenAI API key or ensure the .env file contains it.');
        return;
      }
      const systemPrompt = 'You are an educational psychologist analyzing how a child learns.';
      const userPrompt =
        `Math attempts: ${metrics.mathAttempts || 0}. Math correct: ${metrics.mathCorrect || 0}. ` +
        `Story dragon choices: ${metrics.storyDragon || 0}. Story river choices: ${metrics.storyRiver || 0}. ` +
        `Drawing strokes: ${metrics.drawingStrokes || 0}. Drawing time (seconds): ${metrics.drawingTime || 0}. ` +
        `Imagination stories: ${metrics.imaginationStories || 0}. ` +
        'Provide a brief analysis of the child\'s learning preferences and suggest personalised advice for their parents.';
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + keyVal,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            max_tokens: 150,
            temperature: 0.5,
          }),
        });
        const data = await response.json();
        const text =
          data.choices &&
          data.choices[0] &&
          data.choices[0].message &&
          data.choices[0].message.content
            ? data.choices[0].message.content
            : 'No analysis returned.';
        document.getElementById('ai-insights-output').textContent = text;
      } catch (err) {
        document.getElementById('ai-insights-output').textContent = 'Error generating AI insights. Please check your API key and try again.';
      }
    });
  }
}

// Imagination Explorer – select character, setting and activity to build a story
function initImaginationPage() {
  const charCards = document.querySelectorAll('.character-option');
  const settingCards = document.querySelectorAll('.setting-option');
  const activityCards = document.querySelectorAll('.activity-option');
  const generateBtn = document.getElementById('generate-story-btn');
  const storyOut = document.getElementById('generated-story');
  if (!generateBtn || !storyOut) return;
  let selectedCharacter = null;
  let selectedSetting = null;
  let selectedActivity = null;
  function selectCard(cards, target) {
    cards.forEach((c) => c.classList.remove('selected'));
    target.classList.add('selected');
  }
  charCards.forEach((card) => {
    card.addEventListener('click', () => {
      selectCard(charCards, card);
      selectedCharacter = card.dataset.value;
    });
  });
  settingCards.forEach((card) => {
    card.addEventListener('click', () => {
      selectCard(settingCards, card);
      selectedSetting = card.dataset.value;
    });
  });
  activityCards.forEach((card) => {
    card.addEventListener('click', () => {
      selectCard(activityCards, card);
      selectedActivity = card.dataset.value;
    });
  });
  generateBtn.addEventListener('click', () => {
    if (!selectedCharacter || !selectedSetting || !selectedActivity) {
      alert('Please choose a character, setting and activity first!');
      return;
    }
    const metrics = loadMetrics();
    // Update selection counts
    const charKey = `imaginationCharacter_${selectedCharacter}`;
    const settingKey = `imaginationSetting_${selectedSetting}`;
    const activityKey = `imaginationActivity_${selectedActivity}`;
    metrics[charKey] = (metrics[charKey] || 0) + 1;
    metrics[settingKey] = (metrics[settingKey] || 0) + 1;
    metrics[activityKey] = (metrics[activityKey] || 0) + 1;
    metrics.imaginationStories = (metrics.imaginationStories || 0) + 1;
    saveMetrics(metrics);
    // Provide mapping for names
    const charNames = {
      dragon: 'dragon',
      robot: 'robot',
      unicorn: 'unicorn',
      fairy: 'fairy',
    };
    const settingNames = {
      forest: 'forest',
      space: 'space',
      castle: 'castle',
      ocean: 'ocean',
    };
    const activityNames = {
      exploring: 'exploring',
      singing: 'singing',
      dancing: 'dancing',
      cooking: 'cooking',
      painting: 'painting',
    };
    const charName = charNames[selectedCharacter] || selectedCharacter;
    const settingName = settingNames[selectedSetting] || selectedSetting;
    const activityName = activityNames[selectedActivity] || selectedActivity;
    const story = `Once upon a time, a friendly ${charName} went to the ${settingName}. ` +
      `There, the ${charName} loved ${activityName} and made many new friends. The end.`;
    storyOut.textContent = story;
  });
}

// Initialize the correct page when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Determine which page is being shown by checking for unique markers
  if (document.querySelector('.hero')) initHomePage();
  if (document.getElementById('math-question')) initMathPage();
  if (document.getElementById('story-text')) initStoryPage();
  if (document.getElementById('drawing-canvas')) initDrawingPage();
  if (document.getElementById('report-content')) initReportPage();
  if (document.getElementById('generated-story')) initImaginationPage();
});