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
        
        // Find probabilities for each class
        const dogPred = prediction.find(p => p.className === 'Dog');
        const catPred = prediction.find(p => p.className === 'Cat');
        
        const dogPercent = (dogPred.probability * 100).toFixed(2);
        const catPercent = (catPred.probability * 100).toFixed(2);
        
        // Determine the top result for the description and emoji
        const topResult = [...prediction].sort((a, b) => b.probability - a.probability)[0];
        
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
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 1.4rem; margin-bottom: 0.5rem;">결과: ${topResult.className === 'Dog' ? '강아지상' : '고양이상'} ${emoji}</div>
                <div style="display: flex; justify-content: space-around; font-size: 1rem; margin-bottom: 1rem; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 8px;">
                    <span>🐶 강아지상: ${dogPercent}%</span>
                    <span>🐱 고양이상: ${catPercent}%</span>
                </div>
            </div>
            <p style="font-size: 0.9rem; font-weight: normal; color: var(--text-color); opacity: 0.8; line-height: 1.4;">${description}</p>
        `;
        resetBtn.style.display = 'block';
    } catch (e) {
        console.error("Prediction failed:", e);
        resultContainer.textContent = "Error during analysis. Please try a different image.";
        resetBtn.style.display = 'block';
    }
}
