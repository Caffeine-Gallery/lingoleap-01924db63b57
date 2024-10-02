import { backend } from 'declarations/backend';

const inputText = document.getElementById('inputText');
const targetLanguage = document.getElementById('targetLanguage');
const translationOutput = document.getElementById('translationOutput');
const speakButton = document.getElementById('speakButton');
const lastTranslationDiv = document.getElementById('lastTranslation');

let currentTranslation = '';

async function translateText() {
    const text = inputText.value;
    const lang = targetLanguage.value;

    if (text.trim() === '') {
        translationOutput.textContent = '';
        return;
    }

    translationOutput.textContent = 'Translating...';

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${lang}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        currentTranslation = data.responseData.translatedText;
        translationOutput.textContent = currentTranslation;
        await backend.setLastTranslation(currentTranslation);
        updateLastTranslation();
    } catch (error) {
        console.error('Translation error:', error);
        translationOutput.textContent = 'Translation error occurred.';
    }
}

function speakTranslation() {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentTranslation);
        utterance.lang = targetLanguage.value;
        speechSynthesis.speak(utterance);
    } else {
        alert('Text-to-speech is not supported in your browser.');
    }
}

async function updateLastTranslation() {
    try {
        const lastTranslation = await backend.getLastTranslation();
        lastTranslationDiv.textContent = `Last translation: ${lastTranslation}`;
        lastTranslationDiv.style.display = lastTranslation ? 'block' : 'none';
    } catch (error) {
        console.error('Error fetching last translation:', error);
    }
}

inputText.addEventListener('input', debounce(translateText, 300));
targetLanguage.addEventListener('change', translateText);
speakButton.addEventListener('click', speakTranslation);

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

updateLastTranslation();
