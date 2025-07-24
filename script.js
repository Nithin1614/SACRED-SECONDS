// Mobile-first approach with performance optimization
const isMobile = window.innerWidth <= 768;
const isSmallMobile = window.innerWidth <= 480;
const supportsTouch = 'ontouchstart' in window;

// Main app state
let currentStep = 1;
let meditationTimer = null;
let isMuted = false;
let teachings = [];
let originalBodyStyle = '';
let isModalOpen = false;

// Performance optimization: Reduce particles on mobile
const particleCount = isMobile ? 8 : 20;

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

// Sample teachings data (fallback for teachings.json)
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
    setupMobileOptimizations();
    loadTeachings();
});

// Initialize the application
function initializeApp() {
    currentStep = 1;
    showStep(1);
    
    // Mobile-optimized audio setup
    elements.backgroundMusic.volume = isMobile ? 0.2 : 0.3;
    
    // Mobile-safe focus (prevent keyboard issues)
    if (!isMobile) {
        elements.worryInput.focus();
    }
    
    console.log('Meditation app initialized - Mobile:', isMobile);
}

// Setup mobile-specific optimizations
function setupMobileOptimizations() {
    if (!isMobile) return;
    
    // Prevent iOS zoom on input focus
    elements.worryInput.style.fontSize = '16px';
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.style.fontSize = '16px';
    }
    
    // Optimize touch events for mobile
    setupTouchOptimizations();
    
    // Handle viewport changes
    window.addEventListener('resize', debounce(handleMobileResize, 250));
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // Prevent unwanted mobile behaviors
    preventMobileScrolling();
    
    console.log('Mobile optimizations applied');
}

// Setup touch optimizations
function setupTouchOptimizations() {
    // Enhanced touch feedback for buttons
    const touchButtons = [elements.releaseBtn, elements.muteBtn, elements.chatBtn, elements.newTeachingBtn, elements.restartBtn];
    
    touchButtons.forEach(button => {
        if (!button) return;
        
        button.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s ease';
        }, { passive: true });
        
        button.addEventListener('touchend', function(e) {
            this.style.transform = 'scale(1)';
        }, { passive: true });
        
        button.addEventListener('touchcancel', function(e) {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// Handle mobile resize events
function handleMobileResize() {
    if (isMobile && isModalOpen) {
        // Readjust chat modal for new viewport
        setTimeout(() => {
            adjustChatModalForMobile();
        }, 100);
    }
}

// Handle orientation change
function handleOrientationChange() {
    if (isModalOpen) {
        setTimeout(() => {
            adjustChatModalForMobile();
        }, 200);
    }
}

// Prevent unwanted mobile scrolling
function preventMobileScrolling() {
    // Prevent pull-to-refresh
    document.body.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    document.body.addEventListener('touchend', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Setup all event listeners
function setupEventListeners() {
    // Release button
    elements.releaseBtn.addEventListener('click', startMeditation);
    
    // Enhanced enter key handling for mobile
    elements.worryInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            startMeditation();
        }
    });
    
    // Control buttons with enhanced mobile support
    elements.muteBtn.addEventListener('click', toggleMute);
    elements.chatBtn.addEventListener('click', openChatbot);
    elements.closeChatBtn.addEventListener('click', closeChatbot);
    
    // Teaching buttons
    elements.newTeachingBtn.addEventListener('click', showRandomTeaching);
    elements.restartBtn.addEventListener('click', restartApp);
    
    // Mobile-optimized auto-resize for textarea
    elements.worryInput.addEventListener('input', function() {
        if (!isMobile) {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 200) + 'px';
        }
    });
    
    // Enhanced chatbot modal handling
    setupChatModalEventListeners();
    
    console.log('Event listeners setup complete');
}

// Setup chat modal event listeners with mobile optimizations
function setupChatModalEventListeners() {
    // Enhanced modal backdrop click
    elements.chatbotModal.addEventListener('click', function(e) {
        if (e.target === this) {
            e.preventDefault();
            closeChatbot();
        }
    });
    
    // Prevent chatbot modal close when clicking inside
    const chatContainer = document.querySelector('.chatbot-container');
    if (chatContainer) {
        chatContainer.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Mobile-specific touch handling for chat modal
    if (isMobile) {
        elements.chatbotModal.addEventListener('touchmove', function(e) {
            // Only allow scrolling within the messages area
            if (!e.target.closest('.chatbot-messages')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Handle virtual keyboard
        setupVirtualKeyboardHandling();
    }
}

// Setup virtual keyboard handling for mobile
function setupVirtualKeyboardHandling() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput) return;
    
    chatInput.addEventListener('focus', function() {
        this.style.fontSize = '16px'; // Prevent iOS zoom
        
        // Adjust for virtual keyboard
        setTimeout(() => {
            if (window.visualViewport) {
                const keyboardHeight = window.innerHeight - window.visualViewport.height;
                if (keyboardHeight > 150) { // Keyboard is likely open
                    adjustChatModalForKeyboard(keyboardHeight);
                }
            }
        }, 300);
    });
    
    chatInput.addEventListener('blur', function() {
        setTimeout(() => {
            restoreChatModalHeight();
        }, 300);
    });
    
    // Listen for visual viewport changes (keyboard show/hide)
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', debounce(() => {
            if (isModalOpen) {
                const keyboardHeight = window.innerHeight - window.visualViewport.height;
                if (keyboardHeight > 150) {
                    adjustChatModalForKeyboard(keyboardHeight);
                } else {
                    restoreChatModalHeight();
                }
            }
        }, 150));
    }
}

// Adjust chat modal for virtual keyboard
function adjustChatModalForKeyboard(keyboardHeight) {
    const container = document.querySelector('.chatbot-container');
    if (container && isMobile) {
        const availableHeight = window.innerHeight - keyboardHeight - 20;
        container.style.height = Math.max(availableHeight, 300) + 'px';
        container.style.maxHeight = availableHeight + 'px';
    }
}

// Restore chat modal height
function restoreChatModalHeight() {
    const container = document.querySelector('.chatbot-container');
    if (container && isMobile) {
        container.style.height = '100vh';
        container.style.maxHeight = 'none';
    }
}

// Adjust chat modal for mobile
function adjustChatModalForMobile() {
    const container = document.querySelector('.chatbot-container');
    if (container && isMobile) {
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        container.style.height = viewportHeight + 'px';
    }
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
        // Mobile-optimized feedback for empty input
        if (isMobile) {
            // Simple shake effect for mobile
            elements.glowingCircle.style.transform = 'translateX(-10px)';
            setTimeout(() => {
                elements.glowingCircle.style.transform = 'translateX(10px)';
            }, 100);
            setTimeout(() => {
                elements.glowingCircle.style.transform = 'translateX(0)';
            }, 200);
        } else {
            // Full animation for desktop
            elements.glowingCircle.style.animation = 'none';
            elements.glowingCircle.offsetHeight; // Trigger reflow
            elements.glowingCircle.style.animation = 'enhancedPulseGlow 0.3s ease 3';
        }
        
        if (!isMobile) {
            elements.worryInput.focus();
        }
        return;
    }
    
    // Start background music with mobile optimization
    if (!isMuted) {
        elements.backgroundMusic.play().catch(e => {
            console.log('Audio play failed (expected on some mobile browsers):', e);
        });
    }
    
    // Move to meditation step
    elements.worryText.textContent = worryText;
    showStep(2);
    
    // Start 60-second countdown
    startCountdown();
}

// Start the 60-second countdown with mobile optimizations
function startCountdown() {
    let timeLeft = 60;
    let messageIndex = 0;
    
    // Mobile-optimized timer update
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

// Enhanced start transition to Krishna teachings with beautiful particles
function startTransition() {
    // Show dark transition
    showStep(3);
    
    // Add floating particles during transition (desktop only)
    if (!isMobile) {
        createTransitionParticles();
    }
    
    // Continue with existing timing...
    const transitionDelay = isMobile ? 1500 : 2000;
    const teachingDelay = isMobile ? 300 : 500;
    
    setTimeout(() => {
        showStep(4);
        setTimeout(() => {
            showRandomTeaching();
            if (!isMobile) {
                animateKrishnaImage();
            }
        }, teachingDelay);
    }, transitionDelay);
}

// Create beautiful golden transition particles (desktop only)
function createTransitionParticles() {
    const step3 = document.getElementById('step3');
    if (!step3) return; // Safety check
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 3px;
            height: 3px;
            background: radial-gradient(circle, #f4d03f 0%, transparent 70%);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatDivine ${4 + Math.random() * 2}s ease-in-out infinite;
            pointer-events: none;
            z-index: 1;
        `;
        step3.appendChild(particle);
        
        // Remove particles after transition
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
        }, 3000);
    }
}

// Animate Krishna image (desktop only for performance)
function animateKrishnaImage() {
    if (isMobile) return; // Skip animation on mobile
    
    setTimeout(() => {
        elements.krishnaImage.classList.add('small');
    }, 3000);
}

// Show random teaching with mobile optimizations
function showRandomTeaching() {
    if (teachings.length === 0) {
        console.warn('No teachings available');
        return;
    }
    
    const randomTeaching = teachings[Math.floor(Math.random() * teachings.length)];
    
    // Mobile-optimized content updates
    if (isMobile) {
        // Direct update without fade animations on mobile
        updateTeachingContent(randomTeaching);
    } else {
        // Animated update for desktop
        elements.sanskritVerse.style.opacity = '0';
        elements.englishTranslation.style.opacity = '0';
        
        setTimeout(() => {
            updateTeachingContent(randomTeaching);
            elements.sanskritVerse.style.opacity = '1';
            elements.englishTranslation.style.opacity = '1';
            triggerElectricAnimation();
        }, 300);
    }
}

// Update teaching content
function updateTeachingContent(teaching) {
    elements.sanskritVerse.innerHTML = `
        <div class="sanskrit-text">${teaching.sanskrit}</div>
    `;
    
    elements.englishTranslation.innerHTML = `
        <div class="translation-text">${teaching.english}</div>
        <div class="explanation-text">${teaching.explanation}</div>
    `;
}

// Trigger electric animation (desktop only)
function triggerElectricAnimation() {
    if (isMobile) return; // Skip animation on mobile
    
    const sanskritText = elements.sanskritVerse.querySelector('.sanskrit-text');
    if (sanskritText) {
        sanskritText.style.animation = 'none';
        sanskritText.offsetHeight; // Trigger reflow
        
        sanskritText.style.textShadow = `
            0 0 5px rgba(244, 208, 63, 0.8),
            0 0 10px rgba(244, 208, 63, 0.6),
            0 0 15px rgba(244, 208, 63, 0.4),
            0 0 20px rgba(244, 208, 63, 0.2)
        `;
        
        setTimeout(() => {
            sanskritText.style.animation = 'goldenElectricFlow 2s ease-in-out';
        }, 100);
    }
}

// Enhanced toggle mute with mobile optimization
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
    
    // Enhanced visual feedback
    const scaleValue = isMobile ? '0.9' : '0.85';
    elements.muteBtn.style.transform = `scale(${scaleValue})`;
    setTimeout(() => {
        elements.muteBtn.style.transform = 'scale(1)';
    }, 150);
}

// CRITICAL: Enhanced mobile-optimized chatbot functions
function openChatbot() {
    console.log('Opening chatbot - Mobile:', isMobile);
    
    // Store original body styles
    originalBodyStyle = document.body.style.cssText;
    isModalOpen = true;
    
    // Mobile-specific modal handling
    if (isMobile) {
        // Prevent body scroll and movement
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.top = '0';
        document.body.style.left = '0';
        
        // Prevent viewport scaling
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        
        // Adjust modal for mobile
        setTimeout(() => {
            adjustChatModalForMobile();
        }, 100);
    }
    
    elements.chatbotModal.classList.add('active');
    
    // Focus handling
    setTimeout(() => {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            if (isMobile) {
                // Don't auto-focus on mobile to prevent keyboard issues
                chatInput.style.fontSize = '16px';
            } else {
                chatInput.focus();
            }
        }
    }, 300);
}

// Enhanced close chatbot function
function closeChatbot() {
    console.log('Closing chatbot');
    
    elements.chatbotModal.classList.remove('active');
    isModalOpen = false;
    
    // Restore body scroll and styles
    if (isMobile) {
        document.body.classList.remove('modal-open');
        document.body.style.cssText = originalBodyStyle;
        
        // Restore viewport scaling
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
        
        // Reset chat modal styles
        const container = document.querySelector('.chatbot-container');
        if (container) {
            container.style.height = '';
            container.style.maxHeight = '';
        }
    }
}

// Enhanced restart function with mobile optimizations
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
    
    // Mobile-safe focus
    setTimeout(() => {
        if (!isMobile) {
            elements.worryInput.focus();
        }
    }, 500);
}

// Enhanced keyboard shortcuts with mobile considerations
document.addEventListener('keydown', function(e) {
    // Skip keyboard shortcuts on mobile or when typing
    if (isMobile || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Only handle escape for closing chatbot
        if (e.key === 'Escape' && elements.chatbotModal.classList.contains('active')) {
            e.preventDefault();
            closeChatbot();
        }
        return;
    }
    
    // Desktop keyboard shortcuts
    switch (e.key) {
        case 'Escape':
            if (elements.chatbotModal.classList.contains('active')) {
                e.preventDefault();
                closeChatbot();
            }
            break;
        case ' ':
            e.preventDefault();
            toggleMute();
            break;
        case 'r':
        case 'R':
            e.preventDefault();
            restartApp();
            break;
        case 'n':
        case 'N':
            if (currentStep === 4) {
                e.preventDefault();
                showRandomTeaching();
            }
            break;
    }
});

// Enhanced visibility change handler
document.addEventListener('visibilitychange', function() {
    if (document.hidden && !isMuted) {
        elements.backgroundMusic.pause();
    } else if (!document.hidden && !isMuted && currentStep >= 2) {
        elements.backgroundMusic.play().catch(e => {
            console.log('Audio play failed:', e);
        });
    }
});

// Window beforeunload cleanup
window.addEventListener('beforeunload', function() {
    if (meditationTimer) {
        clearInterval(meditationTimer);
    }
});

// Utility function for debouncing
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

// Add mobile-optimized dynamic styles
const style = document.createElement('style');
style.textContent = `
    /* Mobile body lock styles */
    .modal-open {
        overflow: hidden !important;
        position: fixed !important;
        width: 100% !important;
        height: 100% !important;
    }
    
    /* Desktop-only animations */
    @media (min-width: 769px) {
        @keyframes electricPulse {
            0%, 100% {
                text-shadow: 
                    0 0 5px rgba(244, 208, 63, 0.8),
                    0 0 10px rgba(244, 208, 63, 0.6),
                    0 0 15px rgba(244, 208, 63, 0.4),
                    0 0 20px rgba(244, 208, 63, 0.2);
            }
            50% {
                text-shadow: 
                    0 0 10px rgba(244, 208, 63, 1),
                    0 0 20px rgba(244, 208, 63, 0.8),
                    0 0 30px rgba(244, 208, 63, 0.6),
                    0 0 40px rgba(244, 208, 63, 0.4),
                    0 0 50px rgba(244, 208, 63, 0.2);
            }
        }
        
        @keyframes floatDivine {
            0% {
                transform: translateY(20px) rotate(0deg);
                opacity: 0;
            }
            20% {
                opacity: 1;
            }
            80% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100px) rotate(360deg);
                opacity: 0;
            }
        }
    }
    
    .explanation-text {
        margin-top: 15px;
        font-size: ${isMobile ? '1rem' : '1.1rem'};
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
    
    /* Mobile-specific optimizations */
    @media (max-width: 768px) {
        .chatbot-container {
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
        }
        
        .chatbot-messages {
            overscroll-behavior: contain;
        }
        
        /* Prevent text selection issues on mobile */
        .sanskrit-verse, .english-translation {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
        }
    }
`;
document.head.appendChild(style);

// Console welcome message
console.log(`
🕉️ 60 Second Meditation App Loaded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Features:
   • 60-second guided meditation
   • Divine teachings from Krishna
   • Spiritual chatbot guidance
   • Mobile-optimized experience

📱 Mobile Optimizations:
   • Touch-friendly interface
   • Stable chat window
   • Performance optimized
   • Keyboard-safe inputs

🎹 Desktop Shortcuts:
   • Space: Toggle mute
   • R: Restart app
   • N: New teaching
   • Escape: Close chatbot

🙏 May you find peace and wisdom
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Device: ${isMobile ? 'Mobile' : 'Desktop'}
Touch: ${supportsTouch ? 'Supported' : 'Not detected'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Export functions for potential external use
window.MeditationApp = {
    restart: restartApp,
    toggleMute: toggleMute,
    showTeaching: showRandomTeaching,
    openChat: openChatbot,
    closeChat: closeChatbot,
    isMobile: isMobile
};
