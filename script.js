// Main app state
let currentStep = 1;
let meditationTimer = null;
let isMuted = false;
let teachings = [];

// DOM elements
const steps = {
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    step4: document.getElementById('step4')
};

const elements = {
    worryInput: document.getElementById('worryInput'),
    releaseBtn: document.getElementById('releaseBtn'),
    glowingCircle: document.getElementById('glowingCircle'),
    shrinkingCircle: document.getElementById('shrinkingCircle'),
    worryText: document.getElementById('worryText'),
    timer: document.getElementById('timer'),
    calmingText: document.getElementById('calmingText'),
    meditationMessage: document.getElementById('meditationMessage'),
    krishnaImage: document.getElementById('krishnaImage'),
    krishnaImageContainer: document.getElementById('krishnaImageContainer'),
    sanskritVerse: document.getElementById('sanskritVerse'),
    englishTranslation: document.getElementById('englishTranslation'),
    newTeachingBtn: document.getElementById('newTeachingBtn'),
    restartBtn: document.getElementById('restartBtn'),
    muteBtn: document.getElementById('muteBtn'),
    chatBtn: document.getElementById('chatBtn'),
    chatbotModal: document.getElementById('chatbotModal'),
    closeChatBtn: document.getElementById('closeChatBtn'),
    backgroundMusic: document.getElementById('backgroundMusic'),
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Calming messages for meditation phase
const calmingMessages = [
    "Your worry is dissolving into stardust...",
    "Feel the peace flowing through your soul...",
    "The universe is embracing your concern...",
    "Breathe deeply and release all tension...",
    "Your burden is becoming light as air...",
    "The divine is receiving your message...",
    "Let go and trust in the cosmic flow...",
    "Your worry is transforming into wisdom...",
    "Feel the healing energy surrounding you...",
    "The stars are carrying your pain away...",
    "You are safe in this moment of peace...",
    "Your heart is opening to divine love...",
    "Release and let the universe guide you...",
    "Feel the weight lifting from your shoulders...",
    "Your worry is melting into pure light..."
];

// Sample teachings data (will be replaced by teachings.json)
const sampleTeachings = [
    {
        sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
        english: "You have the right to perform your actions, but never to the fruits of action. Do not let the fruits of action be your motive, nor let your attachment be to inaction.",
        explanation: "This verse teaches us about detached action. We should focus on doing our duty without being attached to the results. This brings peace and reduces anxiety about outcomes."
    },
    {
        sanskrit: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।",
        english: "Established in yoga, perform actions, abandoning attachment, O Arjuna, and be even-minded in success and failure.",
        explanation: "True yoga is maintaining equanimity in all situations. When we act without attachment and remain balanced in success and failure, we find inner peace."
    },
    {
        sanskrit: "मन्मना भव मद्भक्तो मद्याजी मां नमस्कुरु।",
        english: "Fix your mind on Me, be devoted to Me, sacrifice to Me, bow down to Me. Thus uniting yourself with Me, you shall come to Me.",
        explanation: "Complete surrender and devotion to the Divine brings ultimate peace. When we align our thoughts, actions, and prayers with the Supreme, we find our true home."
    }
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadTeachings();
});

// Initialize the application
function initializeApp() {
    // Set initial state
    currentStep = 1;
    showStep(1);
    
    // Setup audio
    elements.backgroundMusic.volume = 0.3;
    
    // Focus on input
    elements.worryInput.focus();
    
    console.log('Meditation app initialized');
}

// Setup all event listeners
function setupEventListeners() {
    // Release button
    elements.releaseBtn.addEventListener('click', startMeditation);
    
    // Enter key on worry input
    elements.worryInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            startMeditation();
        }
    });
    
    // Control buttons
    elements.muteBtn.addEventListener('click', toggleMute);
    elements.chatBtn.addEventListener('click', openChatbot);
    elements.closeChatBtn.addEventListener('click', closeChatbot);
    
    // Teaching buttons
    elements.newTeachingBtn.addEventListener('click', showRandomTeaching);
    elements.restartBtn.addEventListener('click', restartApp);
    
    // Auto-resize textarea
    elements.worryInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });
    
    // Close chatbot when clicking outside
    elements.chatbotModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeChatbot();
        }
    });
    
    // Prevent chatbot modal close when clicking inside
    document.querySelector('.chatbot-container').addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Load teachings from JSON file
async function loadTeachings() {
    try {
        showLoading(true);
        const response = await fetch('teachings.json');
        if (response.ok) {
            teachings = await response.json();
            console.log(`Loaded ${teachings.length} teachings`);
        } else {
            console.warn('Could not load teachings.json, using sample data');
            teachings = sampleTeachings;
        }
    } catch (error) {
        console.warn('Error loading teachings:', error);
        teachings = sampleTeachings;
    } finally {
        showLoading(false);
    }
}

// Show/hide loading overlay
function showLoading(show) {
    if (show) {
        elements.loadingOverlay.classList.add('active');
    } else {
        elements.loadingOverlay.classList.remove('active');
    }
}

// Show specific step
function showStep(stepNumber) {
    // Hide all steps
    Object.values(steps).forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    const targetStep = steps[`step${stepNumber}`];
    if (targetStep) {
        targetStep.classList.add('active');
        currentStep = stepNumber;
    }
}

// Start meditation process
function startMeditation() {
    const worryText = elements.worryInput.value.trim();
    
    if (!worryText) {
        // Gentle shake animation for empty input
        elements.glowingCircle.style.animation = 'none';
        elements.glowingCircle.offsetHeight; // Trigger reflow
        elements.glowingCircle.style.animation = 'pulseGlow 0.3s ease 3';
        elements.worryInput.focus();
        return;
    }
    
    // Start background music
    if (!isMuted) {
        elements.backgroundMusic.play().catch(e => {
            console.log('Audio play failed:', e);
        });
    }
    
    // Move to meditation step
    elements.worryText.textContent = worryText;
    showStep(2);
    
    // Start 60-second countdown
    startCountdown();
}

// Start the 60-second countdown
function startCountdown() {
    let timeLeft = 60;
    let messageIndex = 0;
    
    // Update timer display
    const updateTimer = () => {
        elements.timer.textContent = timeLeft;
        
        // Change calming message every 4 seconds
        if (timeLeft % 4 === 0) {
            elements.calmingText.textContent = calmingMessages[messageIndex % calmingMessages.length];
            messageIndex++;
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(meditationTimer);
            startTransition();
        }
    };
    
    // Initial update
    updateTimer();
    
    // Start interval
    meditationTimer = setInterval(updateTimer, 1000);
}

// Start transition to Krishna teachings
function startTransition() {
    // Show dark transition
    showStep(3);
    
    // After 2 seconds, show Krishna teachings
    setTimeout(() => {
        showStep(4);
        setTimeout(() => {
            showRandomTeaching();
            animateKrishnaImage();
        }, 500);
    }, 2000);
}

// Animate Krishna image
function animateKrishnaImage() {
    // After initial animation, move Krishna to top
    setTimeout(() => {
        elements.krishnaImage.classList.add('small');
    }, 3000);
}

// Show random teaching
function showRandomTeaching() {
    if (teachings.length === 0) {
        console.warn('No teachings available');
        return;
    }
    
    const randomTeaching = teachings[Math.floor(Math.random() * teachings.length)];
    
    // Clear previous content with fade out
    elements.sanskritVerse.style.opacity = '0';
    elements.englishTranslation.style.opacity = '0';
    
    setTimeout(() => {
        // Set Sanskrit verse
        elements.sanskritVerse.innerHTML = `
            <div class="sanskrit-text">${randomTeaching.sanskrit}</div>
        `;
        
        // Set English translation
        elements.englishTranslation.innerHTML = `
            <div class="translation-text">${randomTeaching.english}</div>
            <div class="explanation-text">${randomTeaching.explanation}</div>
        `;
        
        // Fade in with animations
        elements.sanskritVerse.style.opacity = '1';
        elements.englishTranslation.style.opacity = '1';
        
        // Trigger electric animation on Sanskrit text
        triggerElectricAnimation();
        
    }, 300);
}

// Trigger electric animation on Sanskrit text
function triggerElectricAnimation() {
    const sanskritText = elements.sanskritVerse.querySelector('.sanskrit-text');
    if (sanskritText) {
        // Remove any existing animation
        sanskritText.style.animation = 'none';
        sanskritText.offsetHeight; // Trigger reflow
        
        // Add electric glow effect
        sanskritText.style.textShadow = `
            0 0 5px rgba(184, 169, 255, 0.8),
            0 0 10px rgba(184, 169, 255, 0.6),
            0 0 15px rgba(184, 169, 255, 0.4),
            0 0 20px rgba(184, 169, 255, 0.2)
        `;
        
        // Animate the electric flow
        setTimeout(() => {
            sanskritText.style.animation = 'electricPulse 2s ease-in-out';
        }, 100);
    }
}

// Toggle mute
function toggleMute() {
    isMuted = !isMuted;
    
    if (isMuted) {
        elements.backgroundMusic.pause();
        elements.muteBtn.innerHTML = '<span class="mute-icon">🔇</span>';
    } else {
        if (currentStep >= 2) {
            elements.backgroundMusic.play().catch(e => {
                console.log('Audio play failed:', e);
            });
        }
        elements.muteBtn.innerHTML = '<span class="mute-icon">🔊</span>';
    }
    
    // Add visual feedback
    elements.muteBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        elements.muteBtn.style.transform = 'scale(1)';
    }, 150);
}

// Open chatbot
function openChatbot() {
    elements.chatbotModal.classList.add('active');
    
    // Focus on chat input after animation
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.focus();
        }
    }, 300);
}

// Close chatbot
function closeChatbot() {
    elements.chatbotModal.classList.remove('active');
}

// Restart the app
function restartApp() {
    // Clear timer if running
    if (meditationTimer) {
        clearInterval(meditationTimer);
        meditationTimer = null;
    }
    
    // Reset form
    elements.worryInput.value = '';
    elements.worryInput.style.height = 'auto';
    
    // Reset Krishna image
    elements.krishnaImage.classList.remove('small');
    
    // Stop music
    elements.backgroundMusic.pause();
    elements.backgroundMusic.currentTime = 0;
    
    // Reset to first step
    showStep(1);
    
    // Focus on input
    setTimeout(() => {
        elements.worryInput.focus();
    }, 500);
}

// Add electric pulse animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes electricPulse {
        0%, 100% {
            text-shadow: 
                0 0 5px rgba(184, 169, 255, 0.8),
                0 0 10px rgba(184, 169, 255, 0.6),
                0 0 15px rgba(184, 169, 255, 0.4),
                0 0 20px rgba(184, 169, 255, 0.2);
        }
        50% {
            text-shadow: 
                0 0 10px rgba(184, 169, 255, 1),
                0 0 20px rgba(184, 169, 255, 0.8),
                0 0 30px rgba(184, 169, 255, 0.6),
                0 0 40px rgba(184, 169, 255, 0.4),
                0 0 50px rgba(184, 169, 255, 0.2);
        }
    }
    
    .explanation-text {
        margin-top: 15px;
        font-size: 1.1rem;
        color: #a8a3c7;
        font-style: italic;
        line-height: 1.6;
    }
    
    .translation-text {
        font-weight: 500;
        margin-bottom: 10px;
    }
    
    .sanskrit-text {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Handle visibility change (pause music when tab is hidden)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && !isMuted) {
        elements.backgroundMusic.pause();
    } else if (!document.hidden && !isMuted && currentStep >= 2) {
        elements.backgroundMusic.play().catch(e => {
            console.log('Audio play failed:', e);
        });
    }
});

// Handle window beforeunload
window.addEventListener('beforeunload', function() {
    if (meditationTimer) {
        clearInterval(meditationTimer);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close chatbot
    if (e.key === 'Escape' && elements.chatbotModal.classList.contains('active')) {
        closeChatbot();
    }
    
    // Space bar to mute/unmute (when not typing)
    if (e.key === ' ' && e.target !== elements.worryInput && !elements.chatbotModal.classList.contains('active')) {
        e.preventDefault();
        toggleMute();
    }
    
    // R key to restart (when not typing)
    if (e.key === 'r' && e.target !== elements.worryInput && !elements.chatbotModal.classList.contains('active')) {
        e.preventDefault();
        restartApp();
    }
    
    // N key for new teaching (when in step 4)
    if (e.key === 'n' && currentStep === 4 && e.target !== elements.worryInput && !elements.chatbotModal.classList.contains('active')) {
        e.preventDefault();
        showRandomTeaching();
    }
});

// Console welcome message
console.log(`
🕉️ 60 Second Meditation App Loaded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Features:
   • 60-second guided meditation
   • Divine teachings from Krishna
   • Spiritual chatbot guidance
   • Calming animations & music

🎹 Keyboard shortcuts:
   • Space: Toggle mute
   • R: Restart app
   • N: New teaching (in step 4)
   • Escape: Close chatbot

🙏 May you find peace and wisdom
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Export functions for potential external use
window.MeditationApp = {
    restart: restartApp,
    toggleMute: toggleMute,
    showTeaching: showRandomTeaching,
    openChat: openChatbot
};