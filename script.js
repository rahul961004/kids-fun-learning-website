/*
 * Interactive learning site script (improved UI version)
 *
 * This file powers the math adventure, story adventure, drawing studio
 * and parent report. It records basic usage metrics in localStorage so
 * that parents can see how their child engages with each activity. The
 * hero and story illustrations are loaded from image files rather than
 * inline SVGs for a richer, more playful presentation.
 */

const METRICS_KEY = 'kidsFunMetrics';

// Load stored metrics or initialise to an empty object
function loadMetrics() {
  const raw = localStorage.getItem(METRICS_KEY);
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Save metrics to localStorage
function saveMetrics(metrics) {
  localStorage.setItem(METRICS_KEY, JSON.stringify(metrics));
}

// Increment a metric counter
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

// Home page initialisation
function initHomePage() {
  const heroEl = document.getElementById('hero-img');
  // Assign our friendly robot illustration
  if (heroEl) {
    // Images reside at the repository root on GitHub Pages, so drop the images/ prefix
    heroEl.src = 'hero_robot.png';
  }
}

// Math Adventure
function initMathPage() {
  const qEl = document.getElementById('math-question');
  const ansEl = document.getElementById('math-answer');
  const submitBtn = document.getElementById('math-submit');
  const resultEl = document.getElementById('math-result');
  let current;
  function generate() {
    const op = Math.random() < 0.5 ? '+' : '-';
    let a = Math.floor(Math.random() * 21);
    let b = Math.floor(Math.random() * 21);
    if (op === '-' && b > a) {
      [a, b] = [b, a];
    }
    current = op === '+' ? a + b : a - b;
    qEl.textContent = `${a} ${op} ${b} = ?`;
    ansEl.value = '';
    resultEl.textContent = '';
    resultEl.style.color = '';
  }
  submitBtn.addEventListener('click', () => {
    const val = parseInt(ansEl.value, 10);
    const metrics = loadMetrics();
    metrics.mathAttempts = (metrics.mathAttempts || 0) + 1;
    if (!isNaN(val) && val === current) {
      resultEl.textContent = 'Great job! That’s correct!';
      resultEl.style.color = '#006400';
      metrics.mathCorrect = (metrics.mathCorrect || 0) + 1;
    } else {
      resultEl.textContent = `Oops! The correct answer was ${current}. Try another!`;
      resultEl.style.color = '#b30000';
    }
    saveMetrics(metrics);
    setTimeout(generate, 1500);
  });
  generate();
}

// Story Adventure
function initStoryPage() {
  const imgLeft = document.getElementById('story-img-left');
  const imgRight = document.getElementById('story-img-right');
  // Load friendly dragon and river illustrations
  // Images reside at the repository root on GitHub Pages, so drop the images/ prefix
  if (imgLeft) imgLeft.src = 'dragon.png';
  if (imgRight) imgRight.src = 'river.png';
  const textEl = document.getElementById('story-text');
  const optionsEl = document.getElementById('story-options');
  // Story nodes define each part of the choose‑your‑own‑adventure
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
      btn.className = 'btn';
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
      btn.className = 'btn';
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

// Drawing Studio
function initDrawingPage() {
  const canvas = document.getElementById('drawing-canvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('color-picker');
  const sizeRange = document.getElementById('brush-size');
  const clearBtn = document.getElementById('clear-canvas');
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
  window.addEventListener('resize', resize);
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stop);
  canvas.addEventListener('mouseleave', stop);
  // Start timer and record strokes/time when leaving page
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

// Parent Report
async function initReportPage() {
  const container = document.getElementById('report-content');
  const metrics = loadMetrics();
  // Build summary table
  let html = '<h3>Activity Summary</h3><table><thead><tr><th>Activity</th><th>Metric</th><th>Value</th></tr></thead><tbody>';
  html += `<tr><td>Math</td><td>Attempts</td><td>${metrics.mathAttempts || 0}</td></tr>`;
  html += `<tr><td>Math</td><td>Correct</td><td>${metrics.mathCorrect || 0}</td></tr>`;
  html += `<tr><td>Story</td><td>Dragon choices</td><td>${metrics.storyDragon || 0}</td></tr>`;
  html += `<tr><td>Story</td><td>River choices</td><td>${metrics.storyRiver || 0}</td></tr>`;
  html += `<tr><td>Drawing</td><td>Strokes</td><td>${metrics.drawingStrokes || 0}</td></tr>`;
  html += `<tr><td>Drawing</td><td>Minutes</td><td>${Math.round((metrics.drawingTime || 0) / 60)}</td></tr>`;
  // Imagination metrics
  html += `<tr><td>Imagination</td><td>Stories</td><td>${metrics.imaginationStories || 0}</td></tr>`;
  html += '</tbody></table>';
  // Suggestions based on metrics
  const suggestions = [];
  const totalAttempts = metrics.mathAttempts || 0;
  const totalCorrect = metrics.mathCorrect || 0;
  if (totalAttempts > 0) {
    const rate = totalCorrect / totalAttempts;
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
  // Suggestions based on imagination choices
  const charCounts = {
    dragon: metrics.imaginationCharacter_dragon || 0,
    robot: metrics.imaginationCharacter_robot || 0,
    unicorn: metrics.imaginationCharacter_unicorn || 0,
  };
  const maxChar = Object.keys(charCounts).reduce((a, b) => (charCounts[a] > charCounts[b] ? a : b));
  if (metrics.imaginationStories) {
    if (maxChar === 'unicorn') {
      suggestions.push('Your child enjoys magical creatures. Offer fantasy books and imaginative play.');
    } else if (maxChar === 'dragon') {
      suggestions.push('Your child loves adventure and mythical beings. Encourage storytelling and creative games.');
    } else if (maxChar === 'robot') {
      suggestions.push('Your child is drawn to robots and technology. Explore STEM toys and science activities.');
    }
  }
  html += '<h3>Suggestions</h3><ul>' + suggestions.map((s) => `<li>${s}</li>`).join('') + '</ul>';
  container.innerHTML = html;
  // AI insights support remains unchanged. The optional AI feature allows
  // parents to generate a personalised analysis by entering their OpenAI
  // API key. This portion mirrors the original implementation.
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
      const userPrompt = `Math attempts: ${metrics.mathAttempts || 0}. Math correct: ${metrics.mathCorrect || 0}. Story dragon choices: ${metrics.storyDragon || 0}. Story river choices: ${metrics.storyRiver || 0}. Drawing strokes: ${metrics.drawingStrokes || 0}. Drawing time (seconds): ${metrics.drawingTime || 0}. Provide a brief analysis of the child\'s learning preferences and suggest personalised advice for their parents.`;
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
        const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content ? data.choices[0].message.content : 'No analysis returned.';
        document.getElementById('ai-insights-output').textContent = text;
      } catch (err) {
        document.getElementById('ai-insights-output').textContent = 'Error generating AI insights. Please check your API key and try again.';
      }
    });
  }
}

// Imagination Explorer
function initImaginationPage() {
  // Elements for selections
  const charCards = document.querySelectorAll('.character-option');
  const settingCards = document.querySelectorAll('.setting-option');
  const activityCards = document.querySelectorAll('.activity-option');
  const generateBtn = document.getElementById('generate-story-btn');
  const storyOut = document.getElementById('generated-story');
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
    // Record metrics for selections
    const metrics = loadMetrics();
    const charKey = `imaginationCharacter_${selectedCharacter}`;
    const settingKey = `imaginationSetting_${selectedSetting}`;
    const activityKey = `imaginationActivity_${selectedActivity}`;
    metrics[charKey] = (metrics[charKey] || 0) + 1;
    metrics[settingKey] = (metrics[settingKey] || 0) + 1;
    metrics[activityKey] = (metrics[activityKey] || 0) + 1;
    metrics.imaginationStories = (metrics.imaginationStories || 0) + 1;
    saveMetrics(metrics);
    // Build a simple story from selections
    const charNames = { dragon: 'dragon', robot: 'robot', unicorn: 'unicorn' };
    const settingNames = { forest: 'forest', space: 'space', castle: 'castle' };
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
    const story = `Once upon a time, a friendly ${charName} went to the ${settingName}. There, the ${charName} loved ${activityName} and made many new friends. The end.`;
    storyOut.textContent = story;
  });
}

// Expose functions globally so that inline scripts in HTML can call them
window.initHomePage = initHomePage;
window.initMathPage = initMathPage;
window.initStoryPage = initStoryPage;
window.initDrawingPage = initDrawingPage;
window.initReportPage = initReportPage;
window.initImaginationPage = initImaginationPage;