const lottoNumbersDiv = document.querySelector('.lotto-numbers');
const generatorBtn = document.getElementById('generator-btn');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Lotto logic
function generateLottoNumbers() {
    const numbers = [];
    while (numbers.length < 6) {
        const rand = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(rand)) {
            numbers.push(rand);
        }
    }
    numbers.sort((a, b) => a - b);
    displayNumbers(numbers);
}

function displayNumbers(numbers) {
    lottoNumbersDiv.innerHTML = '';
    numbers.forEach(num => {
        const ball = document.createElement('div');
        ball.classList.add('lotto-ball');
        ball.textContent = num;
        lottoNumbersDiv.appendChild(ball);
    });
}

generatorBtn.addEventListener('click', generateLottoNumbers);

// Theme toggle logic
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    if (body.classList.contains('dark')) {
        themeToggle.textContent = 'Light Mode';
    } else {
        themeToggle.textContent = 'Dark Mode';
    }
});

// Teachable Machine logic
const URL = "https://teachablemachine.withgoogle.com/models/WbTY28uhe/";
let model, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

const imageUpload = document.getElementById('image-upload');
const uploadBtn = document.getElementById('upload-btn');
const imagePreview = document.getElementById('image-preview');
const resultContainer = document.getElementById('result-container');

uploadBtn.addEventListener('click', () => imageUpload.click());

imageUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
        resultContainer.textContent = 'Analyzing...';
        
        if (!model) await init();
        predict();
    };
    reader.readAsDataURL(file);
});

async function predict() {
    const prediction = await model.predict(imagePreview);
    prediction.sort((a, b) => b.probability - a.probability);
    
    const topResult = prediction[0];
    const percentage = (topResult.probability * 100).toFixed(2);
    
    let emoji = topResult.className === 'Dog' ? '🐶' : '🐱';
    resultContainer.innerHTML = `Result: ${topResult.className} ${emoji} (${percentage}%)`;
}
