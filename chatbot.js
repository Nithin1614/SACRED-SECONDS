// Mobile-Optimized Spiritual Chatbot for Krishna/Bhagavad Gita guidance
class SpiritualChatbot {
    constructor() {
        // Mobile detection for optimizations
        this.isMobile = window.innerWidth <= 768;
        this.isSmallMobile = window.innerWidth <= 480;
        this.supportsTouch = 'ontouchstart' in window;
        
        // API configuration
        this.apiEndpoint = '/api/chat';
        this.conversationHistory = [];
        this.isTyping = false;
        
        // Mobile-specific state
        this.keyboardVisible = false;
        this.originalViewportHeight = window.innerHeight;
        
        this.initializeChatbot();
        this.setupEventListeners();
        
        // Apply mobile optimizations
        if (this.isMobile) {
            this.setupMobileOptimizations();
        }
        
        console.log(`Spiritual chatbot initialized - Mobile: ${this.isMobile}`);
    }

    initializeChatbot() {
        this.chatMessages = document.getElementById('chatbotMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendChatBtn');
        this.chatModal = document.getElementById('chatbotModal');
        this.chatContainer = document.querySelector('.chatbot-container');
        
        // Validate required elements
        if (!this.chatMessages || !this.chatInput || !this.sendButton) {
            console.error('Required chatbot elements not found');
            return;
        }
        
        console.log('Spiritual chatbot DOM elements initialized');
    }

    setupMobileOptimizations() {
        console.log('Applying mobile-specific chatbot optimizations');
        
        // Prevent iOS zoom by ensuring 16px font size
        this.chatInput.style.fontSize = '16px';
        this.chatInput.style.lineHeight = '1.4';
        this.chatInput.style.webkitTextSizeAdjust = '100%';
        
        // Optimize for touch
        this.chatInput.style.touchAction = 'manipulation';
        
        // Mobile-specific input handling
        this.setupMobileInputHandling();
        
        // Handle orientation changes
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        
        // Visual Viewport API support for better keyboard handling
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', this.handleViewportResize.bind(this));
        }
        
        // Prevent unwanted mobile behaviors
        this.preventMobileScrollIssues();
    }

    setupMobileInputHandling() {
        // Enhanced mobile input focus handling
        this.chatInput.addEventListener('focus', () => {
            console.log('Chat input focused on mobile');
            this.keyboardVisible = true;
            
            // Prevent viewport jumping
            this.chatInput.style.fontSize = '16px';
            
            // Scroll input into view after keyboard appears
            setTimeout(() => {
                this.scrollInputIntoView();
                this.adjustForKeyboard();
            }, 300);
        });
        
        this.chatInput.addEventListener('blur', () => {
            console.log('Chat input blurred on mobile');
            this.keyboardVisible = false;
            
            // Restore container height when keyboard hides
            setTimeout(() => {
                this.restoreContainerHeight();
            }, 300);
        });
        
        // Handle input changes without auto-resize on mobile
        this.chatInput.addEventListener('input', () => {
            // Skip auto-resize on mobile to prevent layout issues
            if (this.isMobile) {
                return;
            }
            
            // Desktop auto-resize
            this.chatInput.style.height = 'auto';
            const newHeight = Math.min(this.chatInput.scrollHeight, 100);
            this.chatInput.style.height = newHeight + 'px';
        });
    }

    handleViewportResize() {
        if (!this.isMobile || !this.chatModal.classList.contains('active')) return;
        
        const currentViewportHeight = window.visualViewport.height;
        const keyboardHeight = this.originalViewportHeight - currentViewportHeight;
        
        if (keyboardHeight > 150) {
            // Keyboard is likely visible
            this.adjustForKeyboard(keyboardHeight);
        } else {
            // Keyboard is likely hidden
            this.restoreContainerHeight();
        }
    }

    handleOrientationChange() {
        if (!this.isMobile) return;
        
        setTimeout(() => {
            this.originalViewportHeight = window.innerHeight;
            if (this.chatModal.classList.contains('active')) {
                this.adjustContainerForMobile();
            }
        }, 200);
    }

    scrollInputIntoView() {
        if (this.isMobile && this.chatInput) {
            this.chatInput.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
        }
    }

    adjustForKeyboard(keyboardHeight = null) {
        if (!this.isMobile || !this.chatContainer) return;
        
        const viewport = window.visualViewport || window;
        const availableHeight = keyboardHeight ? 
            (this.originalViewportHeight - keyboardHeight - 20) : 
            (viewport.height - 20);
        
        const minHeight = this.isSmallMobile ? 300 : 400;
        const adjustedHeight = Math.max(availableHeight, minHeight);
        
        this.chatContainer.style.height = adjustedHeight + 'px';
        this.chatContainer.style.maxHeight = adjustedHeight + 'px';
        
        // Ensure messages area maintains proper scrolling
        setTimeout(() => {
            if (this.chatMessages) {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }
        }, 100);
    }

    restoreContainerHeight() {
        if (!this.isMobile || !this.chatContainer) return;
        
        this.chatContainer.style.height = '100vh';
        this.chatContainer.style.maxHeight = 'none';
    }

    adjustContainerForMobile() {
        if (!this.isMobile || !this.chatContainer) return;
        
        const viewportHeight = window.visualViewport ? 
            window.visualViewport.height : 
            window.innerHeight;
            
        this.chatContainer.style.height = viewportHeight + 'px';
    }

    preventMobileScrollIssues() {
        if (!this.isMobile) return;
        
        // Prevent overscroll and pull-to-refresh in chat area
        this.chatMessages.addEventListener('touchmove', (e) => {
            const scrollTop = this.chatMessages.scrollTop;
            const scrollHeight = this.chatMessages.scrollHeight;
            const height = this.chatMessages.clientHeight;
            
            // Prevent overscroll at top and bottom
            if ((scrollTop === 0 && e.touches[0].clientY > e.touches[0].startY) ||
                (scrollTop === scrollHeight - height && e.touches[0].clientY < e.touches[0].startY)) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Store initial touch position
        this.chatMessages.addEventListener('touchstart', (e) => {
            e.touches[0].startY = e.touches[0].clientY;
        }, { passive: true });
    }

    setupEventListeners() {
        // Enhanced send button with mobile optimization
        this.sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.sendMessage();
        });
        
        // Mobile-optimized enter key handling
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                
                // Add slight delay on mobile to prevent double-send
                if (this.isMobile) {
                    setTimeout(() => this.sendMessage(), 50);
                } else {
                    this.sendMessage();
                }
            }
        });
        
        // Enhanced mobile touch feedback for send button
        if (this.supportsTouch) {
            this.sendButton.addEventListener('touchstart', () => {
                this.sendButton.style.transform = 'scale(0.95)';
            }, { passive: true });
            
            this.sendButton.addEventListener('touchend', () => {
                this.sendButton.style.transform = 'scale(1)';
            }, { passive: true });
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message || this.isTyping) {
            return;
        }

        console.log('Sending message:', message);

        // Check if message is spiritual-related
        if (!this.isSpiritualTopic(message)) {
            this.addMessage('bot', "🙏 I'm here to guide you on spiritual matters related to Krishna, the Bhagavad Gita, and divine wisdom. How can I help you on your spiritual journey?");
            this.clearInput();
            return;
        }

        // Add user message
        this.addMessage('user', message);
        this.clearInput();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response through secure backend
            const response = await this.getAIResponse(message);
            this.hideTypingIndicator();
            this.addMessage('bot', response);
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            
            // Mobile-friendly error message
            const errorMsg = this.isMobile ? 
                "🙏 Connection issue. Please try again." :
                "🙏 I apologize, but I'm having trouble connecting to divine wisdom right now. Please try again in a moment, or reflect on a Krishna teaching from the main app.";
                
            this.addMessage('bot', errorMsg);
        }
    }

    clearInput() {
        this.chatInput.value = '';
        if (!this.isMobile) {
            this.chatInput.style.height = 'auto';
        }
        
        // Restore focus on mobile if keyboard was visible
        if (this.isMobile && this.keyboardVisible) {
            // Small delay to prevent keyboard flicker
            setTimeout(() => {
                this.chatInput.focus();
            }, 100);
        }
    }

    isSpiritualTopic(message) {
        const spiritualKeywords = [
            'krishna', 'gita', 'bhagavad', 'spiritual', 'god', 'divine', 'soul', 'dharma', 'karma', 'yoga',
            'meditation', 'peace', 'wisdom', 'enlightenment', 'consciousness', 'atman', 'brahman',
            'devotion', 'surrender', 'prayer', 'mantra', 'temple', 'sacred', 'holy', 'bliss',
            'liberation', 'moksha', 'samadhi', 'bhakti', 'seva', 'guru', 'teachings', 'scripture',
            'arjuna', 'kurukshetra', 'vedas', 'upanishads', 'hindu', 'hinduism', 'philosophy',
            'inner', 'self', 'truth', 'reality', 'eternal', 'infinite', 'transcendence', 'love',
            'compassion', 'detachment', 'mindfulness', 'awareness', 'presence', 'faith', 'belief',
            'worship', 'ritual', 'ceremony', 'festival', 'janmashtami', 'radha', 'vrindavan',
            'mathura', 'govinda', 'hari', 'vishnu', 'avatar', 'incarnation', 'leela', 'flute',
            'stress', 'anxiety', 'worry', 'fear', 'anger', 'sadness', 'depression', 'guidance'
        ];

        const lowerMessage = message.toLowerCase();
        return spiritualKeywords.some(keyword => lowerMessage.includes(keyword)) || 
               this.containsQuestionWords(lowerMessage);
    }

    containsQuestionWords(message) {
        const questionWords = [
            'why', 'how', 'what', 'when', 'where', 'who', 'meaning', 'purpose', 
            'life', 'suffering', 'happiness', 'peace', 'help', 'guide', 'teach'
        ];
        return questionWords.some(word => message.includes(word));
    }

    async getAIResponse(message) {
        // Add message to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        // Keep conversation history manageable (mobile optimization)
        const maxHistory = this.isMobile ? 16 : 20;
        if (this.conversationHistory.length > maxHistory) {
            this.conversationHistory = this.conversationHistory.slice(-maxHistory);
        }

        // Send request to secure backend endpoint
        const requestBody = {
            message: message,
            conversationHistory: this.conversationHistory,
            mobile: this.isMobile,
            userAgent: navigator.userAgent
        };

        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            // Mobile timeout optimization
            signal: AbortSignal.timeout(this.isMobile ? 15000 : 30000)
        });

        if (!response.ok) {
            throw new Error(`Backend request failed: ${response.status}`);
        }

        const data = await response.json();
        const aiMessage = data.response;

        // Add AI response to conversation history
        this.conversationHistory.push({
            role: 'assistant',
            content: aiMessage
        });

        return aiMessage;
    }

    addMessage(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        
        // Format message with spiritual highlighting
        let formattedMessage = message;
        if (sender === 'bot') {
            formattedMessage = this.formatSpiritualMessage(message);
        }
        
        messageDiv.innerHTML = `<p>${formattedMessage}</p>`;
        
        // Mobile-optimized message addition
        if (this.isMobile) {
            // Direct append without animations for better mobile performance
            this.chatMessages.appendChild(messageDiv);
            
            // Smooth scroll to bottom
            requestAnimationFrame(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            });
        } else {
            // Desktop: smooth animations
            messageDiv.style.opacity = '0';
            this.chatMessages.appendChild(messageDiv);
            
            requestAnimationFrame(() => {
                messageDiv.style.transition = 'opacity 0.3s ease';
                messageDiv.style.opacity = '1';
            });
            
            setTimeout(() => {
                this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            }, 50);
        }
    }

    formatSpiritualMessage(message) {
        // Enhanced spiritual formatting with mobile considerations
        message = message.replace(/\bKrishna\b/g, '<span style="color: #b8a9ff; font-weight: 500;">Krishna</span>');
        message = message.replace(/\bBhagavad Gita\b/g, '<span style="color: #9d8df1; font-weight: 500;">Bhagavad Gita</span>');
        message = message.replace(/\bArjuna\b/g, '<span style="color: #b8a9ff;">Arjuna</span>');
        message = message.replace(/\bLord\b/g, '<span style="color: #9d8df1;">Lord</span>');
        
        // Sanskrit words highlighting
        message = message.replace(/\b(dharma|karma|yoga|moksha|samadhi|bhakti|atman|brahman|satsang|darshan|prasadam)\b/gi, 
            '<span style="color: #c9b6ff; font-style: italic;">$1</span>');
        
        // Add breathing space for mobile reading
        if (this.isMobile && message.length > 200) {
            message = message.replace(/\. /g, '.<br><br>');
        }
            
        return message;
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.sendButton.disabled = true;
        this.sendButton.textContent = this.isMobile ? '...' : 'Thinking...';
        
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('bot-message', 'typing-indicator');
        typingDiv.innerHTML = '<p>🙏 Seeking divine wisdom...</p>';
        typingDiv.id = 'typing-indicator';
        
        // Mobile-optimized appearance
        if (this.isMobile) {
            this.chatMessages.appendChild(typingDiv);
        } else {
            typingDiv.style.opacity = '0';
            this.chatMessages.appendChild(typingDiv);
            
            requestAnimationFrame(() => {
                typingDiv.style.transition = 'opacity 0.2s ease';
                typingDiv.style.opacity = '1';
            });
        }
        
        // Scroll to show typing indicator
        requestAnimationFrame(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        });
    }

    hideTypingIndicator() {
        this.isTyping = false;
        this.sendButton.disabled = false;
        this.sendButton.textContent = 'Send';
        
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Enhanced welcome message with mobile optimization
    showWelcomeMessage() {
        // Only show if there's just the initial message
        if (this.chatMessages.children.length <= 1) {
            const welcomeMessages = this.isMobile ? [
                "✨ Welcome! Ask me about Krishna's wisdom and spiritual guidance.",
                "🙏 Namaste! I'm here for spiritual questions and Bhagavad Gita teachings.",
                "🕉️ Greetings! Explore Krishna consciousness and divine wisdom with me."
            ] : [
                "✨ Welcome, divine soul! I'm here to share Krishna's wisdom and guide you on your spiritual path.",
                "🙏 Namaste! Ask me about the Bhagavad Gita, Lord Krishna's teachings, or any spiritual guidance you seek.",
                "🕉️ Greetings! I'm here to help you explore the depths of Krishna consciousness and spiritual wisdom."
            ];
            
            const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
            
            setTimeout(() => {
                this.addMessage('bot', randomWelcome);
            }, this.isMobile ? 300 : 500);
        }
    }

    // Clear conversation with mobile optimization
    clearHistory() {
        this.conversationHistory = [];
        
        const initialMessage = this.isMobile ?
            "🙏 I'm here for spiritual guidance. How can I help?" :
            "🙏 Namaste! I'm here to help with spiritual questions, Bhagavad Gita teachings, and Lord Krishna's wisdom. How may I guide you today?";
            
        this.chatMessages.innerHTML = `
            <div class="bot-message">
                <p>${initialMessage}</p>
            </div>
        `;
    }

    // Handle modal visibility changes
    onModalOpen() {
        console.log('Chat modal opened');
        
        if (this.isMobile) {
            // Store original viewport height
            this.originalViewportHeight = window.innerHeight;
            
            // Adjust container for mobile
            setTimeout(() => {
                this.adjustContainerForMobile();
            }, 100);
        }
        
        // Show welcome message
        this.showWelcomeMessage();
    }

    onModalClose() {
        console.log('Chat modal closed');
        
        // Reset keyboard state
        this.keyboardVisible = false;
        
        // Clear any pending focus
        if (this.chatInput) {
            this.chatInput.blur();
        }
    }
}

// Enhanced initialization with mobile-aware timing
document.addEventListener('DOMContentLoaded', function() {
    // Wait for other scripts to load
    const initDelay = window.innerWidth <= 768 ? 200 : 100;
    
    setTimeout(() => {
        try {
            window.spiritualChatbot = new SpiritualChatbot();
            
            // Enhanced chat button integration
            const chatBtn = document.getElementById('chatBtn');
            const chatModal = document.getElementById('chatbotModal');
            
            if (chatBtn && chatModal) {
                // Override existing click handler to integrate with modal state
                chatBtn.addEventListener('click', function(e) {
                    // Let the main script handle opening
                    setTimeout(() => {
                        if (window.spiritualChatbot && chatModal.classList.contains('active')) {
                            window.spiritualChatbot.onModalOpen();
                        }
                    }, 350);
                });
                
                // Listen for modal close
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                            if (!chatModal.classList.contains('active') && window.spiritualChatbot) {
                                window.spiritualChatbot.onModalClose();
                            }
                        }
                    });
                });
                
                observer.observe(chatModal, { attributes: true });
            }
            
            console.log('🙏 Spiritual chatbot ready for divine guidance');
            
        } catch (error) {
            console.error('Failed to initialize spiritual chatbot:', error);
        }
    }, initDelay);
});

// Enhanced mobile-safe export
if (typeof window !== 'undefined') {
    window.SpiritualChatbot = SpiritualChatbot;
}

// Add mobile-specific CSS optimizations
const mobileStyles = document.createElement('style');
mobileStyles.textContent = `
    /* Mobile chatbot optimizations */
    @media (max-width: 768px) {
        .typing-indicator {
            animation: none !important;
        }
        
        .bot-message, .user-message {
            word-break: break-word;
            overflow-wrap: anywhere;
        }
        
        .chatbot-messages {
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-y: contain;
        }
        
        #chatInput {
            -webkit-appearance: none;
            -webkit-border-radius: 20px;
            border-radius: 20px;
        }
        
        #chatInput:focus {
            -webkit-user-select: text;
            user-select: text;
        }
    }
    
    /* Prevent zoom on inputs for all browsers */
    @media (max-width: 768px) {
        input[type="text"], textarea {
            font-size: 16px !important;
            -webkit-text-size-adjust: 100%;
        }
    }
`;
document.head.appendChild(mobileStyles);
