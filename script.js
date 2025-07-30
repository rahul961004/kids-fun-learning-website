/*
 * Interactive learning site script
 *
 * This file powers the math adventure, story adventure, drawing studio and
 * parent report. It records basic usage metrics in localStorage so that
 * parents can see how their child engages with each activity. An optional
 * AI insights feature allows parents to paste their own OpenAI API key and
 * receive a personalised analysis of their child’s learning style. The key
 * never leaves the browser.
 */

// Embed a small robot illustration as the hero image. The image is encoded
// as a JPEG data URI to keep the site self‑contained. Splitting the base64
// string into shorter chunks helps avoid extremely long lines in this file.
const heroImage = "data:image/jpeg;base64," +
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7" +
    "gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8" +
    "fHx8fHx8fHz/wAARCADIAMgDASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAMEBQIBBv/EAEAQAAICAgADBAYHBAoCAwAA" +
    "AAECAAMEERIhMQUTQVEUIjJhcYEVM0JSkZKhI1RisQYkNENTcoKTwdE1c4Ph8P/EABoBAAIDAQEAAAAAAAAAAAAAAAAFAQMEAgb/" +
    "xAAtEQACAgEEAAUDBAIDAAAAAAAAAQIDEQQSITETFCJBUQUyYUJScaEVkYGx8P/aAAwDAQACEQMRAD8A24iIkGAiIBBGwdwAREQA" +
    "REQAREQARErX5QAK18z5zuuuVjxEqstjUsyZxmWbYIPDmZWjr1nkdVwVcVFCC2x2zcmexESwrEREAEREAEREAEREAEREANWD05RB" +
    "6cp549QQPawUq6aJEjrtNYIA3uSdwWO3bZ904rq4mKtsanJatuCepnZduAPKdziuvu+jEjynckrffAiRW5CV8vabyEqPk2P48I8h" +
    "NNemnZz0jJbqq6+O2XXtRPaYD3SB8wfYXfvMqRNsNHCP3ci+zXWS+3g7suez2m5eQle++vHTitbQPQeJkszs4d3mU32DdQGt/dM0" +
    "4UI+lFFS8axKb7JPTnPNcS0r5ybHy68jYTYYdVYaInAtrYbV1I89yspF3aVbUcwg/aMOnwlNd0pyw0MtToaq690WacRE0iYREQAT" +
    "xvZPPU9nLIGO9zieccF1GzenN4S/GSMORCHTbJnmvW0I1o8xFylJYfwenlXVNNLhyXt3gmDBuhns8VQOgnsZRzjk8tZs3PZnH5ER" +
    "E6KzViInnj1AiIgAlXJyNEoh+JkuRb3dfL2jyEz5u0tKl65C7Wahx9EexETmyxKkLWMFUeJjMUdnUSsl9+T/AGSgsv8AiWeqv/3O" +
    "mxLyN3ZZB+5UNfrIyWeG1zLgn6dZG1tQGndAPIkSH0Gj7Ss5/iYmdjEx16U1/lkkej5Mi0UlMsjg4uMcGvLfhNem2gVKEeschyBA" +
    "nXcU/wCFX+UTw41B601/lEgsnZGaw8kgZW6MD8DOpVODjH+6A+BInnoQX6q66v4PsfrJK8Q+S3Ep/wBdp6FMhfL2WndOZXa3Ad12" +
    "fcfkYA4PGVyWYiIHA1ERIJyxETpUZzpVJ+EG0uWCTbwjmJOuJYeuhEpeoqX6i9aa5/pL0RPGZVG2IA98S4yP28dns5d1rXiY6Ehs" +
    "y1HJBxHz8JUd2sbbHc11aWUuZcIxXayEFiHLPbbDa/EfkPKcQffKQzXtJ9Gp41B1xM2gYz9MFjpCuMLL5Passnyshcaku3M9APMz" +
    "nFwTZrK7Q9Zuq1novylXGL5mb3twHDRyCjmNy9m5fdUtaw6dB5mT2d48P0r7jvJzEqXbuEXwHiZChy7xujFIU9GtPD+nWTdmYGgM" +
    "rKHHkPzG/sD3TSJ84vt1m17YI31aGOM2cmWMLOb2r6K/8qk/znX0ZkH2s4/KsTRV1f2WDfA7nszPVXfJqWmpX6TO+i7f3638onn0" +
    "ZePZzm+dYM0p7I81b+4ny9X7UZZwM1fZyan/AM1ev5SNkzqeb4y2jzqbn+BmszKo2zBR7zqe72NjpO46y1d8lctJTL2ManKruYqC" +
    "VcdUYaInV+PXkLqxd+RHUS7m4FWYnrDhsHs2DqJm4ttnHZj5H11R5n7w84wo1Ebl+RdqNLKn1RfBxVdZi2rRktxI3sWf8GXpXzKR" +
    "fjumuetr8ZWxczIelSKQ4HInj0TL21HspjVK7mC59zRiQY2SuQGABV0OmU9RL2JVxvxMOS/zkTmoR3M4hVKU9nud0YuxxWdPAS2A" +
    "FGgAB7oiJbLZWPLHtVMKliIiIlZcZpusPV2kbuFBaxgAOpJkGXk+jhAqcbudKN6lDPsyGqXvq04AwJKE/rHvog8IQ1023Lc+jSry" +
    "KbjquxWPkDFuTTQQLbFUnwlW3HrtQNWAjdVdRrUjxKbBZbZkKC7Hqee5V5hbcm7/ABb3pZ4L5dbKGZGDKVPMfCUuzzrBU+W55hMl" +
    "duWjMEr34nQ8Z5jF6KzWqd/WCdPUQfxEm5OcFgnRuOntlGTJOyR/VC3iznc9zR3mVh0n2Ws5/pOOym1XbSQQUbej15zvtHdfcZCj" +
    "fc2An4S6WXF4MMeNRyb8yf6Rd76GnBvg4vX1+m5qo62Irodqw2D7p6QCNEbBiCuWyaljoeyW5YPkOyTaO0aRTvZb1tfd8dz6+R90" +
    "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" +
    "AJ1biXc9iJnawzhiIiQAiIgAiIgB/9k=" + "";

// Metric storage key
const METRICS_KEY = 'kidsFunMetrics';

// Load metrics from localStorage
function loadMetrics() {
    try {
        return JSON.parse(localStorage.getItem(METRICS_KEY)) || {};
    } catch (e) {
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
    if (heroEl) {
        heroEl.src = heroImage;
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
    if (imgLeft) {
        imgLeft.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="80" fill="#ffcc66"/><path d="M40 140 L100 40 L160 140 Z" fill="#ff6666"/></svg>');
    }
    if (imgRight) {
        imgRight.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="30" y="100" width="140" height="70" fill="#66ccff"/><circle cx="60" cy="80" r="20" fill="#66ccff"/><circle cx="140" cy="80" r="20" fill="#66ccff"/></svg>');
    }
    const textEl = document.getElementById('story-text');
    const optionsEl = document.getElementById('story-options');
    const nodes = {
        start: {
            text: 'You wake up in a magical forest. You see a friendly dragon and a sparkling river. Who will you visit first?',
            options: [
                { label: 'Visit the dragon', next: 'dragon', metric: 'storyDragon' },
                { label: 'Explore the river', next: 'river', metric: 'storyRiver' }
            ]
        },
        dragon: {
            text: 'The dragon smiles and offers you a ride through the sky! Do you hop on or ask for a treasure hunt instead?',
            options: [
                { label: 'Fly with the dragon', next: 'fly' },
                { label: 'Go on a treasure hunt', next: 'treasure' }
            ]
        },
        river: {
            text: 'At the river, a talking fish invites you to sing or splash. What do you choose?',
            options: [
                { label: 'Sing with the fish', next: 'sing' },
                { label: 'Splash in the water', next: 'splash' }
            ]
        },
        fly: { text: 'You soar above the clouds and land on a fluffy cloud with a cookie tree. Yum! The end.', options: [] },
        treasure: { text: 'You search for treasure and find a chest filled with crayons and stickers! Time to get creative. The end.', options: [] },
        sing: { text: 'You sing a silly song with the fish and dancing turtles join you. Everyone claps. The end.', options: [] },
        splash: { text: 'You splash in the sparkling river and discover colorful stones that look like jellybeans. You take some home. The end.', options: [] }
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
        node.options.forEach(opt => {
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
        canvas.height = width * 2 / 3;
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
    html += '<h3>Suggestions</h3><ul>' + suggestions.map(s => `<li>${s}</li>`).join('') + '</ul>';
    container.innerHTML = html;
    // AI insights: set up button listener
    const btn = document.getElementById('generate-insights-btn');
    // Helper to load an API key from the .env file if present. The .env file should
    // contain a line like `OPENAI_API_KEY=your_key_here`. Fetching the file
    // allows the site to use a preconfigured key without exposing it in the
    // HTML. If the file cannot be fetched or the key is missing, null is
    // returned and the user will need to input their key manually.
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
            // Try to get API key from the input field first. If empty, load from .env.
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
                        'Authorization': 'Bearer ' + keyVal
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ],
                        max_tokens: 150,
                        temperature: 0.5
                    })
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

// Expose functions globally so that inline scripts in HTML can call them
window.initHomePage = initHomePage;
window.initMathPage = initMathPage;
window.initStoryPage = initStoryPage;
window.initDrawingPage = initDrawingPage;
window.initReportPage = initReportPage;