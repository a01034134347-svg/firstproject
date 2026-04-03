const generatorBtn = document.getElementById('generator-btn');
const lottoNumbers = document.querySelector('.lotto-numbers');

generatorBtn.addEventListener('click', () => {
    lottoNumbers.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    numbers.forEach(number => {
        const lottoBall = document.createElement('div');
        lottoBall.classList.add('lotto-ball');
        lottoBall.textContent = number;
        lottoNumbers.appendChild(lottoBall);
    });
});