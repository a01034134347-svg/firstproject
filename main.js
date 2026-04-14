// Localization
const lang = document.documentElement.lang || 'en';

const translations = {
    en: {
        loading: 'AI Model is still loading, please wait...',
        analyzing: 'Analyzing...',
        result: 'Result',
        dogFace: 'Dog Face',
        catFace: 'Cat Face',
        horseFace: 'Horse Face',
        raccoonDogFace: 'Raccoon Dog Face',
        koalaFace: 'Koala Face',
        pandaFace: 'Panda Face',
        dogDesc: 'Dog faces give a bright and energetic impression. They have a friendly and kind charm and often have a personality that gives trust to others.',
        catDesc: 'Cat faces give a chic and sophisticated impression. They have a mysterious and attractive atmosphere and stand out for their excellent observation and intellectual side.',
        horseDesc: 'Horse faces give an intelligent and elegant impression. With a tall forehead and refined features, they have a noble and dignified charm that naturally commands respect.',
        raccoonDogDesc: 'Raccoon Dog faces give a warm and gentle impression. With soft, round features and a chubby charm, they radiate approachable friendliness and a grounded, earthy personality.',
        koalaDesc: 'Koala faces give a calm and lovable impression. With big round eyes and soft features, they exude a peaceful and endearing charm that puts everyone at ease.',
        pandaDesc: 'Panda faces give a cute and gentle impression. With a round face and striking contrast, they have a lovable and irresistible charm that draws everyone in.',
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
        horseFace: '말상',
        raccoonDogFace: '너구리상',
        koalaFace: '코알라상',
        pandaFace: '판다상',
        dogDesc: '강아지상은 밝고 에너지가 넘치는 인상을 줍니다. 친근하고 다정한 매력이 있으며 타인에게 신뢰를 주는 성격인 경우가 많습니다.',
        catDesc: '고양이상은 시크하고 세련된 인상을 줍니다. 신비롭고 매력적인 분위기를 가지고 있으며 뛰어난 관찰력과 지적인 면모가 돋보입니다.',
        horseDesc: '말상은 지적이고 우아한 인상을 줍니다. 높은 이마와 세련된 이목구비로 기품 있고 당당한 매력을 지니며, 자연스럽게 존경을 받는 타입입니다.',
        raccoonDogDesc: '너구리상은 따뜻하고 온화한 인상을 줍니다. 부드럽고 둥글둥글한 이목구비에 통통한 매력이 있으며, 친근하고 소탈한 성격으로 주변 사람들과 잘 어울립니다.',
        koalaDesc: '코알라상은 차분하고 사랑스러운 인상을 줍니다. 크고 동그란 눈과 부드러운 이목구비로 평화롭고 귀여운 매력을 발산하며, 보는 사람을 편안하게 만듭니다.',
        pandaDesc: '판다상은 귀엽고 온화한 인상을 줍니다. 둥근 얼굴과 뚜렷한 특징으로 사랑스럽고 거부할 수 없는 매력이 있으며, 모든 사람의 마음을 사로잡습니다.',
        errorModel: '오류: AI 모델을 불러오지 못했습니다. 새로고침 해주세요.',
        errorPredict: '분석 중 오류가 발생했습니다. 다른 사진으로 시도해 주세요.',
        themeLight: '라이트 모드',
        themeDark: '다크 모드'
    }
};

const t = translations[lang] || translations.en;

// Animal config: index matches model class order (DOG=0, CAT=1, HORSE=2, RACCOON DOG=3, KOALA=4, PANDA=5)
const animalConfig = [
    { key: 'dogFace',        emoji: '🐶', descKey: 'dogDesc' },
    { key: 'catFace',        emoji: '🐱', descKey: 'catDesc' },
    { key: 'horseFace',      emoji: '🐴', descKey: 'horseDesc' },
    { key: 'raccoonDogFace', emoji: '🦝', descKey: 'raccoonDogDesc' },
    { key: 'koalaFace',      emoji: '🐨', descKey: 'koalaDesc' },
    { key: 'pandaFace',      emoji: '🐼', descKey: 'pandaDesc' },
];

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
const URL = "https://teachablemachine.withgoogle.com/models/pQbOHgyhk/";
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

        // Find top result
        const topPred = [...prediction].sort((a, b) => b.probability - a.probability)[0];
        const topIndex = prediction.indexOf(topPred);
        const animal = animalConfig[topIndex];

        const resultTitle = t[animal.key];
        const description = t[animal.descKey];
        currentResultTitle = resultTitle;

        // Build percentage bars for all animals
        const barsHTML = prediction.map((pred, i) => {
            const cfg = animalConfig[i];
            const pct = (pred.probability * 100).toFixed(1);
            const isTop = i === topIndex;
            return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="width:80px;font-size:0.85rem;${isTop ? 'font-weight:bold;' : ''}">${cfg.emoji} ${t[cfg.key]}</span>
                <div style="flex:1;background:rgba(0,0,0,0.08);border-radius:4px;height:14px;overflow:hidden;">
                    <div style="width:${pct}%;height:100%;background:${isTop ? '#6C5CE7' : '#b2a8f0'};border-radius:4px;transition:width 0.4s;"></div>
                </div>
                <span style="width:44px;text-align:right;font-size:0.85rem;${isTop ? 'font-weight:bold;color:#6C5CE7;' : ''}">${pct}%</span>
            </div>`;
        }).join('');

        resultContainer.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <div style="font-size: 1.4rem; margin-bottom: 1rem;">${t.result}: <strong>${resultTitle} ${animal.emoji}</strong></div>
                <div style="background: rgba(0,0,0,0.05); padding: 14px 16px; border-radius: 10px; margin-bottom: 1rem;">
                    ${barsHTML}
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
