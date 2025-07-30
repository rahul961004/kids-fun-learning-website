document.addEventListener('DOMContentLoaded', () => {
    initMathGame();
    initStory();
    initDrawing();
});

/* === Math Adventure === */
function initMathGame() {
    const questionEl = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const submitBtn = document.getElementById('submit-answer');
    const resultEl = document.getElementById('result');

    let currentAnswer;

    function generateQuestion() {
        const add = Math.random() < 0.5;
        let a = Math.floor(Math.random() * 21);
        let b = Math.floor(Math.random() * 21);
        if (!add && b > a) {
            [a, b] = [b, a];
        }
        currentAnswer = add ? a + b : a - b;
        questionEl.textContent = `${a} ${add ? '+' : '-'} ${b} = ?`;
        answerInput.value = '';
        resultEl.textContent = '';
    }

    submitBtn.addEventListener('click', () => {
        const userAnswer = parseInt(answerInput.value, 10);
        if (userAnswer === currentAnswer) {
            resultEl.textContent = 'Great job! 🎉';
            setTimeout(generateQuestion, 2000);
        } else {
            resultEl.textContent = 'Try again!';
        }
    });

    generateQuestion();
}

/* === Story Time === */
function initStory() {
    const storyText = document.getElementById('story-text');
    const storyOptions = document.getElementById('story-options');

    const storyNodes = {
        start: {
            text: 'You enter a magical forest. Do you want to follow the path or explore the river?',
            options: [
                { text: 'Follow the path', next: 'path' },
                { text: 'Explore the river', next: 'river' }
            ]
        },
        path: {
            text: 'You meet a friendly dragon who offers you a ride. Do you accept?',
            options: [
                { text: 'Yes', next: 'ride' },
                { text: 'No', next: 'stay' }
            ]
        },
        river: {
            text: 'You find sparkling fish that glow in the water. Do you catch one or just watch?',
            options: [
                { text: 'Catch one', next: 'catch' },
                { text: 'Watch', next: 'watch' }
            ]
        },
        ride: {
            text: 'You soar through the clouds and see a rainbow. You feel happy and safe. The End!',
            options: []
        },
        stay: {
            text: 'The dragon smiles and shows you the way home. You learned kindness. The End!',
            options: []
        },
        catch: {
            text: 'The fish turns into a fairy and grants you a wish. You wished for more adventures! The End!',
            options: []
        },
        watch: {
            text: 'The fish dance and you enjoy the show. You leave with beautiful memories. The End!',
            options: []
        }
    };

    let currentNode = 'start';

    function renderNode(nodeId) {
        const node = storyNodes[nodeId];
        storyText.textContent = node.text;
        storyOptions.innerHTML = '';
        node.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option.text;
            button.className = 'button';
            button.addEventListener('click', () => {
                currentNode = option.next;
                renderNode(currentNode);
            });
            storyOptions.appendChild(button);
        });
        if (node.options.length === 0) {
            const restartBtn = document.createElement('button');
            restartBtn.textContent = 'Play again';
            restartBtn.className = 'button';
            restartBtn.addEventListener('click', () => {
                currentNode = 'start';
                renderNode(currentNode);
            });
            storyOptions.appendChild(restartBtn);
        }
    }

    renderNode(currentNode);
}

/* === Drawing Studio === */
function initDrawing() {
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('color-picker');
    const brushSize = document.getElementById('brush-size');
    const clearBtn = document.getElementById('clear-canvas');
    let drawing = false;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    canvas.addEventListener('mousedown', e => {
        drawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    });

    canvas.addEventListener('mousemove', e => {
        if (!drawing) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSize.value;
        ctx.lineCap = 'round';
        ctx.stroke();
    });

    document.addEventListener('mouseup', () => {
        drawing = false;
    });

    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
}
