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
let model, maxPredictions;
let isModelLoading = true;

async function init() {
    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        isModelLoading = false;
        console.log("Model loaded successfully");
    } catch (e) {
        console.error("Failed to load model:", e);
        resultContainer.textContent = "Error: Failed to load AI model. Please refresh.";
    }
}

// Start loading the model immediately
init();

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
    reader.onload = (event) => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
        uploadArea.style.display = 'none';
        
        // Wait for image to load before predicting
        imagePreview.onload = async () => {
            if (isModelLoading) {
                resultContainer.textContent = 'AI Model is still loading, please wait...';
                // Wait for model to load if it hasn't yet
                while (isModelLoading) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            resultContainer.textContent = 'Analyzing...';
            predict();
        };
    };
    reader.readAsDataURL(file);
}

async function predict() {
    try {
        const prediction = await model.predict(imagePreview);
        
        // Find probabilities by index if names don't match or to be more robust
        // Assuming first class is Dog and second is Cat
        const dogPred = prediction[0];
        const catPred = prediction[1];
        
        const dogPercent = (dogPred.probability * 100).toFixed(2);
        const catPercent = (catPred.probability * 100).toFixed(2);
        
        // Determine the top result
        const topResult = [...prediction].sort((a, b) => b.probability - a.probability)[0];
        const isDog = topResult.className.toLowerCase().includes('dog') || topResult === dogPred;
        
        let emoji = '';
        let description = '';
        let resultTitle = '';

        if (isDog) {
            emoji = '🐶';
            resultTitle = 'Dog Face';
            description = 'Dog faces give a bright and energetic impression. They have a friendly and kind charm and often have a personality that gives trust to others.';
        } else {
            emoji = '🐱';
            resultTitle = 'Cat Face';
            description = 'Cat faces give a chic and sophisticated impression. They have a mysterious and attractive atmosphere and stand out for their excellent observation and intellectual side.';
        }
        
        resultContainer.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 1.4rem; margin-bottom: 0.5rem;">Result: ${resultTitle} ${emoji}</div>
                <div style="display: flex; justify-content: space-around; font-size: 1rem; margin-bottom: 1rem; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 8px;">
                    <span>🐶 Dog Face: ${dogPercent}%</span>
                    <span>🐱 Cat Face: ${catPercent}%</span>
                </div>
            </div>
            <p style="font-size: 0.9rem; font-weight: normal; color: var(--text-color); opacity: 0.8; line-height: 1.4;">${description}</p>
        `;
        resetBtn.style.display = 'block';
    } catch (e) {
        console.error("Prediction failed:", e);
        resultContainer.textContent = "An error occurred during analysis. Please try a different image.";
        resetBtn.style.display = 'block';
    }
}
