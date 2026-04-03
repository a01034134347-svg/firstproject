const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

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
const uploadArea = document.querySelector('.upload-area');
const resetBtn = document.getElementById('reset-btn');

uploadBtn.addEventListener('click', () => imageUpload.click());

resetBtn.addEventListener('click', () => {
    imagePreview.style.display = 'none';
    imagePreview.src = '#';
    resultContainer.textContent = '';
    resetBtn.style.display = 'none';
    uploadArea.style.display = 'block';
    imageUpload.value = '';
});

imageUpload.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

function handleFiles(files) {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
        uploadArea.style.display = 'none';
        resultContainer.textContent = 'Analyzing...';
        
        if (!model) await init();
        predict();
    };
    reader.readAsDataURL(file);
}

async function predict() {
    const prediction = await model.predict(imagePreview);
    prediction.sort((a, b) => b.probability - a.probability);
    
    const topResult = prediction[0];
    const percentage = (topResult.probability * 100).toFixed(2);
    
    let emoji = '';
    let description = '';

    if (topResult.className === 'Dog') {
        emoji = '🐶';
        description = 'Dogs are known for their loyalty and friendliness. They are social animals that enjoy human companionship and exercise.';
    } else {
        emoji = '🐱';
        description = 'Cats are independent, agile, and curious creatures. They are known for their grooming habits and affectionate yet subtle behavior.';
    }
    
    resultContainer.innerHTML = `
        <div style="margin-bottom: 0.5rem;">Result: ${topResult.className} ${emoji} (${percentage}%)</div>
        <p style="font-size: 0.9rem; font-weight: normal; color: var(--text-color); opacity: 0.8; line-height: 1.4;">${description}</p>
    `;
    resetBtn.style.display = 'block';
}
