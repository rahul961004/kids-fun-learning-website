/*
 * Main JavaScript for Kids Fun Learning Adventures
 *
 * This script centralises all activity logic for the website. It uses a
 * data-page attribute on the body tag to initialise the appropriate module.
 *
 * Features include:
 *  - A visual math adventure with star icons representing numbers
 *  - A drawing studio with stroke tracking, image download and AI-powered
 *    real-image generation from drawings or uploaded pictures
 *  - An imagination explorer that records choices for the report
 *  - A story builder that uses the OpenAI API to generate a comic-style
 *    narrative and corresponding illustration based on the child's choices
 *  - A parent report page summarising the child's activity metrics and
 *    rendering a bar chart using Chart.js
 */

// Utility for storing and retrieving metrics from localStorage
function loadMetrics() {
  const defaultMetrics = {
    math: { attempts: 0, correct: 0 },
    story: { dragon: 0, river: 0, other: 0 },
    drawing: { strokes: 0, minutes: 0 },
    imagination: { stories: 0 }
  };
  try {
    return JSON.parse(localStorage.getItem('kfl_metrics')) || defaultMetrics;
  } catch (e) {
    return defaultMetrics;
  }
}

function saveMetrics(metrics) {
  localStorage.setItem('kfl_metrics', JSON.stringify(metrics));
}

// Define the OpenAI API key.  If you have configured an environment
// variable or global via a separate script, it will be picked up from
// `window.OPENAI_API_KEY`.  Otherwise replace the empty string below
// with your actual key.  Exposing a key on the client is not ideal,
// but this project operates entirely on the client side.
const OPENAI_API_KEY = window && window.OPENAI_API_KEY ? window.OPENAI_API_KEY : '';

// Initialise the correct module based on the page
window.addEventListener('DOMContentLoaded', () => {
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
      // nothing for home
      break;
  }
});

/**
 * Math Adventure
 *
 * Children answer randomly generated addition, subtraction and multiplication
 * questions. A visual representation of each problem is displayed using
 * star icons to make abstract numbers more concrete. Difficulty can be
 * adjusted via a select element. Metrics are recorded for attempts and
 * correct answers.
 */
function initMathPage() {
  const metrics = loadMetrics();
  let currentAnswer = null;
  const questionEl = document.getElementById('math-question');
  const answerInput = document.getElementById('math-answer');
  const feedbackEl = document.getElementById('math-feedback');
  const attemptsEl = document.getElementById('math-attempts');
  const correctEl = document.getElementById('math-correct');
  const difficultySelect = document.getElementById('math-difficulty');
  const visualEl = document.getElementById('visual-question');

  function updateScoreboard() {
    attemptsEl.textContent = metrics.math.attempts;
    correctEl.textContent = metrics.math.correct;
  }

  function generateQuestion() {
    const difficulty = difficultySelect.value;
    let max;
    switch (difficulty) {
      case 'easy': max = 10; break;
      case 'medium': max = 20; break;
      case 'hard': max = 50; break;
      default: max = 10;
    }
    const num1 = Math.floor(Math.random() * (max + 1));
    const num2 = Math.floor(Math.random() * (max + 1));
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let answer;
    if (op === '+') answer = num1 + num2;
    if (op === '-') answer = num1 - num2;
    if (op === '*') answer = num1 * num2;
    currentAnswer = answer;
    // Display numeric question
    questionEl.textContent = `${num1} ${op} ${num2} = ?`;
    // Display visual representation with star icons
    const makeStars = (n) => '⭐'.repeat(Math.max(0, n));
    let visual;
    if (op === '+') {
      visual = `${makeStars(num1)} + ${makeStars(num2)}`;
    } else if (op === '-') {
      visual = `${makeStars(num1)} − ${makeStars(num2)}`;
    } else {
      // multiplication: group icons into rows of num2 for num1 times
      const rows = [];
      for (let i = 0; i < num1; i++) rows.push(makeStars(num2));
      visual = rows.join(' × ');
    }
    visualEl.textContent = visual;
    feedbackEl.textContent = '';
    answerInput.value = '';
    answerInput.focus();
  }

  document.getElementById('math-check').addEventListener('click', () => {
    const val = answerInput.value.trim();
    if (val === '') return;
    metrics.math.attempts++;
    if (parseInt(val, 10) === currentAnswer) {
      metrics.math.correct++;
      feedbackEl.style.color = 'green';
      feedbackEl.textContent = 'Great job! That\'s correct!';
    } else {
      feedbackEl.style.color = 'red';
      feedbackEl.textContent = `Oops! The correct answer was ${currentAnswer}.`;
    }
    saveMetrics(metrics);
    updateScoreboard();
    generateQuestion();
  });

  difficultySelect.addEventListener('change', generateQuestion);

  updateScoreboard();
  generateQuestion();
}

/**
 * Drawing Studio
 *
 * This module provides a simple paint-like interface allowing kids to
 * draw with different colours and brush sizes. Strokes are counted to
 * measure engagement. Users can clear the canvas, download their art as
 * a PNG or generate a real-life interpretation using the OpenAI Image API.
 * Parents can also upload images of their child’s drawings for AI
 * transformation.
 */
function initDrawingPage() {
  const metrics = loadMetrics();
  const canvas = document.getElementById('drawing-canvas');
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let strokes = 0;
  let lastTime;
  const colourInput = document.getElementById('colour-picker');
  const sizeInput = document.getElementById('brush-size');
  const clearBtn = document.getElementById('clear-btn');
  const downloadBtn = document.getElementById('download-btn');
  const uploadInput = document.getElementById('upload-input');
  const generateBtn = document.getElementById('generate-btn');
  // We no longer require the user to input an API key.  The key is
  // provided via the global constant OPENAI_API_KEY.  See top of file.
  const resultImg = document.getElementById('ai-result');
  const feedback = document.getElementById('ai-feedback');

  function startDrawing(e) {
    drawing = true;
    strokes++;
    metrics.drawing.strokes = (metrics.drawing.strokes || 0) + 1;
    saveMetrics(metrics);
    draw(e);
    lastTime = Date.now();
  }
  function endDrawing() {
    drawing = false;
    ctx.beginPath();
    // track minutes
    if (lastTime) {
      const diff = (Date.now() - lastTime) / 1000 / 60;
      metrics.drawing.minutes = (metrics.drawing.minutes || 0) + diff;
      saveMetrics(metrics);
    }
  }
  function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = parseInt(sizeInput.value, 10);
    ctx.lineCap = 'round';
    ctx.strokeStyle = colourInput.value;
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDrawing);
  canvas.addEventListener('mouseleave', endDrawing);

  clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  });

  // Convert a given image or canvas to a Blob for OpenAI API
  async function getImageBlob() {
    if (uploadInput.files && uploadInput.files[0]) {
      // Use uploaded file
      return uploadInput.files[0];
    } else {
      // Use canvas drawing
      const dataUrl = canvas.toDataURL('image/png');
      const res = await fetch(dataUrl);
      return await res.blob();
    }
  }

  generateBtn.addEventListener('click', async () => {
    // Use the global API key constant; if it is empty we'll display an error.
    const apiKey = OPENAI_API_KEY;
    if (!apiKey) {
      feedback.style.color = 'red';
      feedback.textContent = 'OpenAI API key is not configured.';
      return;
    }
    feedback.style.color = 'black';
    feedback.textContent = 'Generating image...';
    try {
      const imageBlob = await getImageBlob();
      // The OpenAI image API for variations accepts multipart/form-data
      const formData = new FormData();
      formData.append('image', imageBlob, 'source.png');
      formData.append('n', '1');
      formData.append('size', '512x512');
      const response = await fetch('https://api.openai.com/v1/images/variations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        body: formData
      });
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const data = await response.json();
      const url = data.data[0].url;
      resultImg.src = url;
      feedback.textContent = 'Here is your AI generated image!';
    } catch (err) {
      feedback.style.color = 'red';
      feedback.textContent = 'Error generating image: ' + err.message;
    }
  });
}

/**
 * Imagination Explorer
 *
 * Kids pick a character, setting and activity to create their own mini
 * adventure. Choices are recorded for the report. A simple story is
 * assembled on the fly. This module intentionally remains lightweight as
 * the Story Builder offers a richer experience.
 */
function initImaginationPage() {
  const metrics = loadMetrics();
  const storyOutput = document.getElementById('imagination-story');
  const charButtons = document.querySelectorAll('[data-char]');
  const setButtons = document.querySelectorAll('[data-setting]');
  const actButtons = document.querySelectorAll('[data-activity]');
  const generateBtn = document.getElementById('imagination-generate');
  let selection = { character: null, setting: null, activity: null };

  function updateSelections() {
    generateBtn.disabled = !(selection.character && selection.setting && selection.activity);
  }

  charButtons.forEach(btn => btn.addEventListener('click', () => {
    selection.character = btn.dataset.char;
    charButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateSelections();
  }));
  setButtons.forEach(btn => btn.addEventListener('click', () => {
    selection.setting = btn.dataset.setting;
    setButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateSelections();
  }));
  actButtons.forEach(btn => btn.addEventListener('click', () => {
    selection.activity = btn.dataset.activity;
    actButtons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    updateSelections();
  }));

  generateBtn.addEventListener('click', () => {
    const { character, setting, activity } = selection;
    const story = `Once upon a time, a friendly ${character} went to the ${setting}. There, the ${character} loved ${activity} and made many new friends. The end.`;
    storyOutput.textContent = story;
    metrics.imagination.stories = (metrics.imagination.stories || 0) + 1;
    saveMetrics(metrics);
    // reset
    selection = { character: null, setting: null, activity: null };
    [...charButtons, ...setButtons, ...actButtons].forEach(b => b.classList.remove('selected'));
    updateSelections();
  });
  updateSelections();
}

/**
 * Story Builder
 *
 * Presents multiple choice questions to build a narrative. Once the final
 * choice is made, a call is made to the OpenAI Chat API to generate a
 * short comic-style story. A second call to the OpenAI Image API creates
 * a colourful comic-style illustration based on the selections. An API
 * key must be provided by the parent for the calls to succeed.
 */
function initStoryPage() {
  const metrics = loadMetrics();
  const section = document.getElementById('story-builder');
  const storyOut = document.getElementById('story-text');
  const storyImg = document.getElementById('story-image');
  // We no longer display an input for the API key.  The key is
  // provided via the global OPENAI_API_KEY constant.
  const feedback = document.getElementById('story-feedback');
  // Steps definitions
  // Define the story building steps.  We provide a wider range of choices
  // so that every story feels fresh and tailored to the child’s selections.
  const steps = [
    {
      question: 'Choose a hero for your comic adventure:',
      options: ['Dragon', 'Robot', 'Unicorn', 'Fairy', 'Pirate', 'Astronaut'],
      key: 'hero'
    },
    {
      question: 'Pick a sidekick to join the hero:',
      options: ['Puppy', 'Kitten', 'Dinosaur', 'Alien', 'Turtle', 'Elf'],
      key: 'sidekick'
    },
    {
      question: 'Where will the adventure take place?',
      options: ['Forest', 'Space', 'Castle', 'Ocean', 'Jungle', 'Snowy mountain'],
      key: 'setting'
    },
    {
      question: 'What is the mission?',
      options: ['Rescue a friend', 'Find treasure', 'Explore a cave', 'Throw a party', 'Solve a mystery', 'Build a spaceship'],
      key: 'mission'
    },
    {
      question: 'Choose the tone of the story:',
      options: ['Silly', 'Adventurous', 'Mysterious', 'Funny', 'Spooky', 'Magical'],
      key: 'tone'
    },
    {
      question: 'Select an antagonist to overcome:',
      options: ['Wizard', 'Pirate', 'Robot', 'Giant', 'Ghost', 'Witch'],
      key: 'villain'
    },
    {
      question: 'Pick a special item to help on the journey:',
      options: ['Magic wand', 'Treasure map', 'Time machine', 'Flying carpet', 'Invisible cloak', 'Robot assistant'],
      key: 'item'
    }
  ];
  let selections = {};
  let currentStep = 0;

  function renderStep() {
    section.innerHTML = '';
    if (currentStep >= steps.length) {
      // All choices made, call API to generate story and image
      generateComic();
      return;
    }
    const step = steps[currentStep];
    const qEl = document.createElement('h3');
    qEl.textContent = step.question;
    section.appendChild(qEl);
    const opts = document.createElement('div');
    opts.className = 'story-options';
    step.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.addEventListener('click', () => {
        selections[step.key] = opt;
        currentStep++;
        renderStep();
      });
      opts.appendChild(btn);
    });
    section.appendChild(opts);
  }

  async function generateComic() {
    // Retrieve the API key from the global constant.  Show an error if
    // it has not been configured.
    const apiKey = OPENAI_API_KEY;
    if (!apiKey) {
      feedback.style.color = 'red';
      feedback.textContent = 'OpenAI API key is not configured.';
      return;
    }
    feedback.style.color = 'black';
    feedback.textContent = 'Creating your comic...';
    // Compose a rich prompt incorporating all chosen elements.  The tone, villain and item will
    // influence the narrative to yield a unique adventure.  We ask for a short comic story
    // with playful language and sound effects to engage young readers.
    const prompt = `Create a short children\'s comic story (around 150 words) featuring a ${selections.hero} and a ${selections.sidekick} who go on a mission to ${selections.mission.toLowerCase()} in a ${selections.setting.toLowerCase()}. The story should have a ${selections.tone.toLowerCase()} tone, and the heroes must overcome a ${selections.villain.toLowerCase()} using a ${selections.item.toLowerCase()}. Write in a fun, conversational style with simple sentences appropriate for ages 4–10, and include sound effects and playful dialogue.`;
    try {
      // Chat completion
      const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a creative writer for children.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 250,
          temperature: 0.8
        })
      });
      if (!chatRes.ok) throw new Error('Chat API error');
      const chatData = await chatRes.json();
      const story = chatData.choices[0].message.content.trim();
      storyOut.textContent = story;
      // Image generation with description
      const imgPrompt = `A colourful comic-style illustration of a ${selections.hero.toLowerCase()} and a ${selections.sidekick.toLowerCase()} on a mission to ${selections.mission.toLowerCase()} in a ${selections.setting.toLowerCase()}, with a ${selections.tone.toLowerCase()} mood. They are facing a ${selections.villain.toLowerCase()} and using a ${selections.item.toLowerCase()}. The style should be cute and whimsical, like a children\'s comic book.`;
      const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({ prompt: imgPrompt, n: 1, size: '512x512' })
      });
      if (!imgRes.ok) throw new Error('Image API error');
      const imgData = await imgRes.json();
      storyImg.src = imgData.data[0].url;
      feedback.textContent = 'Your comic is ready!';
      // Record metrics
      metrics.story.other = (metrics.story.other || 0) + 1;
      saveMetrics(metrics);
    } catch (err) {
      feedback.style.color = 'red';
      feedback.textContent = 'Failed to generate comic: ' + err.message;
    }
  }

  renderStep();
}

/**
 * Parent Report
 *
 * Aggregates all metrics and displays them in a table. Simple
 * suggestions provide parents with ideas to encourage further learning.
 * A bar chart visualises the distribution of activities. An optional
 * AI-driven insight box exists on the page to allow parents to generate
 * personalised commentary, but it is outside the scope of this script.
 */
function initReportPage() {
  const metrics = loadMetrics();
  const tableBody = document.getElementById('report-body');
  const suggestionsEl = document.getElementById('report-suggestions');
  const chartCanvas = document.getElementById('metrics-chart');
  // Populate table rows
  const rows = [];
  rows.push({ activity: 'Math', metric: 'Attempts', value: metrics.math.attempts });
  rows.push({ activity: 'Math', metric: 'Correct', value: metrics.math.correct });
  rows.push({ activity: 'Story', metric: 'Stories', value: metrics.story.other });
  rows.push({ activity: 'Drawing', metric: 'Strokes', value: Math.round(metrics.drawing.strokes) });
  rows.push({ activity: 'Drawing', metric: 'Minutes', value: metrics.drawing.minutes.toFixed(1) });
  rows.push({ activity: 'Imagination', metric: 'Stories', value: metrics.imagination.stories });
  tableBody.innerHTML = '';
  rows.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${row.activity}</td><td>${row.metric}</td><td>${row.value}</td>`;
    tableBody.appendChild(tr);
  });
  // Generate suggestions based on metrics
  let suggestions = [];
  if (metrics.math.correct >= metrics.math.attempts * 0.8) {
    suggestions.push('Great math accuracy! Introduce more challenging problems.');
  } else {
    suggestions.push('Practice makes perfect! Keep working on those math problems.');
  }
  if (metrics.drawing.strokes > 50) {
    suggestions.push('Your child loves drawing! Provide a variety of mediums like chalk or clay.');
  } else {
    suggestions.push('Encourage your child to draw more to build fine motor skills.');
  }
  if (metrics.imagination.stories > 0) {
    suggestions.push('Keep nurturing that imagination by telling stories together.');
  }
  suggestionsEl.textContent = suggestions.join(' ');
  // Chart using Chart.js (loaded via CDN in report page)
  const data = {
    labels: ['Math Correct','Math Attempts','Story Stories','Drawing Strokes','Drawing Minutes','Imagination Stories'],
    datasets: [{
      label: 'Activity Metrics',
      data: [metrics.math.correct, metrics.math.attempts, metrics.story.other, metrics.drawing.strokes, metrics.drawing.minutes, metrics.imagination.stories],
      backgroundColor: ['#8e44ad','#c0392b','#16a085','#d35400','#2980b9','#f39c12']
    }]
  };
  new Chart(chartCanvas, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}