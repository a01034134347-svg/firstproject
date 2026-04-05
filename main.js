// Localization
const lang = document.documentElement.lang || 'en';

const translations = {
    en: {
        loading: 'AI Model is still loading, please wait...',
        analyzing: 'Analyzing...',
        result: 'Result',
        dogFace: 'Dog Face',
        catFace: 'Cat Face',
        dogDesc: 'Dog faces give a bright and energetic impression. They have a friendly and kind charm and often have a personality that gives trust to others.',
        catDesc: 'Cat faces give a chic and sophisticated impression. They have a mysterious and attractive atmosphere and stand out for their excellent observation and intellectual side.',
        errorModel: 'Error: Failed to load AI model. Please refresh.',
        errorPredict: 'An error occurred during analysis. Please try a different image.',
        themeLight: 'Light Mode',
        themeDark: 'Dark Mode'
    },
    ko: {
        loading: 'AI 모델을 불러오는 중입니다. 잠시만 기다려 주세요...',
        analyzing: '분석 중...',
        result: '결과',
        dogFace: '강아지상',
        catFace: '고양이상',
        dogDesc: '강아지상은 밝고 에너지가 넘치는 인상을 줍니다. 친근하고 다정한 매력이 있으며 타인에게 신뢰를 주는 성격인 경우가 많습니다.',
        catDesc: '고양이상은 시크하고 세련된 인상을 줍니다. 신비롭고 매력적인 분위기를 가지고 있으며 뛰어난 관찰력과 지적인 면모가 돋보입니다.',
        errorModel: '오류: AI 모델을 불러오지 못했습니다. 새로고침 해주세요.',
        errorPredict: '분석 중 오류가 발생했습니다. 다른 사진으로 시도해 주세요.',
        themeLight: '라이트 모드',
        themeDark: '다크 모드'
    }
};

const t = translations[lang] || translations.en;

// UI Elements
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const imageUpload = document.getElementById('image-upload');
const uploadBtn = document.getElementById('upload-btn');
const imagePreview = document.getElementById('image-preview');
const resultContainer = document.getElementById('result-container');
const uploadArea = document.querySelector('.upload-area');
const resetBtn = document.getElementById('reset-btn');
const shareSection = document.getElementById('share-section');

let currentResultTitle = '';

// Theme toggle logic
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark');
        themeToggle.textContent = body.classList.contains('dark') ? t.themeLight : t.themeDark;
    });
}

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
        if (resultContainer) resultContainer.textContent = t.errorModel;
    }
}

init();

// Event Listeners
if (uploadBtn) uploadBtn.addEventListener('click', () => imageUpload.click());

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        imagePreview.style.display = 'none';
        imagePreview.src = '#';
        resultContainer.textContent = '';
        resetBtn.style.display = 'none';
        if (shareSection) shareSection.style.display = 'none';
        uploadArea.style.display = 'block';
        imageUpload.value = '';
    });
}

if (imageUpload) {
    imageUpload.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

if (uploadArea) {
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
}

function handleFiles(files) {
    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
        uploadArea.style.display = 'none';
        
        imagePreview.onload = async () => {
            if (isModelLoading) {
                resultContainer.textContent = t.loading;
                while (isModelLoading) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            resultContainer.textContent = t.analyzing;
            predict();
        };
    };
    reader.readAsDataURL(file);
}

async function predict() {
    try {
        const prediction = await model.predict(imagePreview);
        const dogPred = prediction[0];
        const catPred = prediction[1];
        
        const dogPercent = (dogPred.probability * 100).toFixed(2);
        const catPercent = (catPred.probability * 100).toFixed(2);
        
        const topResult = [...prediction].sort((a, b) => b.probability - a.probability)[0];
        const isDog = topResult.className.toLowerCase().includes('dog') || topResult === dogPred;
        
        let emoji = '', description = '', resultTitle = '';

        if (isDog) {
            emoji = '🐶';
            resultTitle = t.dogFace;
            description = t.dogDesc;
        } else {
            emoji = '🐱';
            resultTitle = t.catFace;
            description = t.catDesc;
        }
        
        currentResultTitle = resultTitle;

        resultContainer.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 1.4rem; margin-bottom: 0.5rem;">${t.result}: ${resultTitle} ${emoji}</div>
                <div style="display: flex; justify-content: space-around; font-size: 1rem; margin-bottom: 1rem; background: rgba(0,0,0,0.05); padding: 10px; border-radius: 8px;">
                    <span>🐶 ${t.dogFace}: ${dogPercent}%</span>
                    <span>🐱 ${t.catFace}: ${catPercent}%</span>
                </div>
            </div>
            <p style="font-size: 0.9rem; font-weight: normal; color: var(--text-color); opacity: 0.8; line-height: 1.4;">${description}</p>
        `;
        resetBtn.style.display = 'block';
        if (shareSection) shareSection.style.display = 'block';
    } catch (e) {
        console.error("Prediction failed:", e);
        resultContainer.textContent = t.errorPredict;
        resetBtn.style.display = 'block';
    }
}

// Share functions
window.shareTwitter = function() {
    const text = `${t.result}: ${currentResultTitle}! Find your animal face type at AnimalFaceTest. #AnimalFaceTest #AI`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
};

window.shareFacebook = function() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
};

window.copyUrl = function() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert(lang === 'ko' ? '링크가 클립보드에 복사되었습니다!' : 'Link copied to clipboard!');
    });
};

window.shareAll = function() {
    if (navigator.share) {
        navigator.share({
            title: 'Animal Face Test',
            text: `${t.result}: ${currentResultTitle}! Check your animal face type!`,
            url: window.location.href,
        }).catch(console.error);
    } else {
        copyUrl();
    }
};
