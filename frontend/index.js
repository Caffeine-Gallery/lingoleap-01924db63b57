import { AuthClient } from "@dfinity/auth-client";
import { backend } from 'declarations/backend';

const inputText = document.getElementById('inputText');
const targetLanguage = document.getElementById('targetLanguage');
const translationOutput = document.getElementById('translationOutput');
const speakButton = document.getElementById('speakButton');
const lastTranslationDiv = document.getElementById('lastTranslation');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const authSection = document.getElementById('authSection');
const translatorSection = document.getElementById('translatorSection');

let currentTranslation = '';
let authClient;

async function initAuth() {
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
        handleAuthenticated();
    }
}

async function handleAuthenticated() {
    loginButton.style.display = 'none';
    logoutButton.style.display = 'block';
    translatorSection.style.display = 'block';
    updateLastTranslation();
}

async function login() {
    authClient.login({
        identityProvider: "https://identity.ic0.app/#authorize",
        onSuccess: handleAuthenticated,
    });
}

async function logout() {
    await authClient.logout();
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
    translatorSection.style.display = 'none';
    lastTranslationDiv.textContent = '';
}

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
        if (lastTranslation && lastTranslation.length > 0) {
            lastTranslationDiv.textContent = `Last translation: ${lastTranslation[0]}`;
            lastTranslationDiv.style.display = 'block';
        } else {
            lastTranslationDiv.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching last translation:', error);
    }
}

inputText.addEventListener('input', debounce(translateText, 300));
targetLanguage.addEventListener('change', translateText);
speakButton.addEventListener('click', speakTranslation);
loginButton.addEventListener('click', login);
logoutButton.addEventListener('click', logout);

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

initAuth();
