// Spiritual Chatbot for Krishna/Bhagavad Gita guidance
class SpiritualChatbot {
    constructor() {
        // API key will be fetched from server/environment variables
        this.apiEndpoint = '/api/chat'; // Your backend endpoint
        this.conversationHistory = [];
        this.isTyping = false;
        
        this.initializeChatbot();
        this.setupEventListeners();
    }

    initializeChatbot() {
        this.chatMessages = document.getElementById('chatbotMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendChatBtn');
        
        console.log('Spiritual chatbot initialized with secure API handling');
    }

    setupEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter key to send message
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize chat input with stable height management
        this.chatInput.addEventListener('input', () => {
            // Reset height to auto to get proper scrollHeight
            this.chatInput.style.height = 'auto';
            // Set new height within limits
            const newHeight = Math.min(this.chatInput.scrollHeight, 100);
            this.chatInput.style.height = newHeight + 'px';
        });
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message || this.isTyping) {
            return;
        }

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
            this.addMessage('bot', "🙏 I apologize, but I'm having trouble connecting to divine wisdom right now. Please try again in a moment, or reflect on a Krishna teaching from the main app.");
        }
    }

    clearInput() {
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';
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
            'mathura', 'govinda', 'hari', 'vishnu', 'avatar', 'incarnation', 'leela', 'flute'
        ];

        const lowerMessage = message.toLowerCase();
        return spiritualKeywords.some(keyword => lowerMessage.includes(keyword)) || 
               this.containsQuestionWords(lowerMessage);
    }

    containsQuestionWords(message) {
        const questionWords = ['why', 'how', 'what', 'when', 'where', 'who', 'meaning', 'purpose', 'life', 'suffering', 'happiness', 'peace'];
        return questionWords.some(word => message.includes(word));
    }

    async getAIResponse(message) {
        // Add message to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        // Keep conversation history manageable (last 10 exchanges)
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }

        // Send request to your secure backend endpoint
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                conversationHistory: this.conversationHistory
            })
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
        
        // Format message with spiritual emojis and styling
        let formattedMessage = message;
        if (sender === 'bot') {
            formattedMessage = this.formatSpiritualMessage(message);
        }
        
        messageDiv.innerHTML = `<p>${formattedMessage}</p>`;
        
        // Simple fade-in without transform animations that cause issues
        messageDiv.style.opacity = '0';
        this.chatMessages.appendChild(messageDiv);
        
        // Use requestAnimationFrame for smooth animation
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'opacity 0.3s ease';
            messageDiv.style.opacity = '1';
        });

        // Scroll to bottom smoothly
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 50);
    }

    formatSpiritualMessage(message) {
        // Add some spiritual formatting
        message = message.replace(/\bKrishna\b/g, '<span style="color: #b8a9ff; font-weight: 500;">Krishna</span>');
        message = message.replace(/\bBhagavad Gita\b/g, '<span style="color: #9d8df1; font-weight: 500;">Bhagavad Gita</span>');
        message = message.replace(/\bArjuna\b/g, '<span style="color: #b8a9ff;">Arjuna</span>');
        message = message.replace(/\bLord\b/g, '<span style="color: #9d8df1;">Lord</span>');
        
        // Handle Sanskrit words (basic detection)
        message = message.replace(/\b(dharma|karma|yoga|moksha|samadhi|bhakti|atman|brahman)\b/gi, 
            '<span style="color: #c9b6ff; font-style: italic;">$1</span>');
            
        return message;
    }

    showTypingIndicator() {
        this.isTyping = true;
        this.sendButton.disabled = true;
        this.sendButton.textContent = '...';
        
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('bot-message', 'typing-indicator');
        typingDiv.innerHTML = '<p>🙏 Seeking divine wisdom...</p>';
        typingDiv.id = 'typing-indicator';
        
        // Simple appearance without problematic animations
        typingDiv.style.opacity = '0';
        this.chatMessages.appendChild(typingDiv);
        
        requestAnimationFrame(() => {
            typingDiv.style.transition = 'opacity 0.2s ease';
            typingDiv.style.opacity = '1';
        });
        
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
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

    // Public method to add welcome message when chat opens
    showWelcomeMessage() {
        if (this.chatMessages.children.length <= 1) {
            const welcomeMessages = [
                "✨ Welcome, divine soul! I'm here to share Krishna's wisdom and guide you on your spiritual path.",
                "🙏 Namaste! Ask me about the Bhagavad Gita, Lord Krishna's teachings, or any spiritual guidance you seek.",
                "🕉️ Greetings! I'm here to help you explore the depths of Krishna consciousness and spiritual wisdom."
            ];
            
            const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
            
            setTimeout(() => {
                this.addMessage('bot', randomWelcome);
            }, 500);
        }
    }

    // Clear conversation history
    clearHistory() {
        this.conversationHistory = [];
        this.chatMessages.innerHTML = `
            <div class="bot-message">
                <p>🙏 Namaste! I'm here to help with spiritual questions, Bhagavad Gita teachings, and Lord Krishna's wisdom. How may I guide you today?</p>
            </div>
        `;
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure main script is loaded
    setTimeout(() => {
        window.spiritualChatbot = new SpiritualChatbot();
        
        // Show welcome message when chat is opened
        const chatBtn = document.getElementById('chatBtn');
        
        // Override the openChatbot function to show welcome
        chatBtn.addEventListener('click', function() {
            setTimeout(() => {
                window.spiritualChatbot.showWelcomeMessage();
            }, 300);
        });
        
        console.log('Spiritual chatbot ready for divine guidance 🙏');
    }, 100);
});

// Export for potential external use
window.SpiritualChatbot = SpiritualChatbot;