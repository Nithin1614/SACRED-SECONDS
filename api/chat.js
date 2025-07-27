// /api/chat.js - Universally Optimized Vercel serverless function
export default async function handler(req, res) {
    // Enhanced CORS headers with mobile considerations
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent, X-Requested-With, Accept');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Handle preflight requests efficiently
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            allowedMethods: ['POST']
        });
    }

    try {
        const { message, conversationHistory, mobile, userAgent } = req.body;
        
        // Mobile detection from request
        const requestUserAgent = userAgent || req.headers['user-agent'] || '';
        const isMobileRequest = mobile || /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(requestUserAgent);
        const isSlowConnection = /2G|3G|slow/i.test(req.headers['connection'] || '');

        console.log(`Chat request - Mobile: ${isMobileRequest}, Slow connection: ${isSlowConnection}`);

        // Enhanced input validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ 
                error: 'Message is required',
                mobile: isMobileRequest
            });
        }

        if (message.length > 500) {
            return res.status(400).json({ 
                error: 'Message too long. Please keep it under 500 characters.',
                mobile: isMobileRequest
            });
        }

        // Rate limiting check
        const messageWords = message.trim().split(/\s+/).length;
        if (messageWords < 2) {
            return res.status(400).json({ 
                error: 'Please provide a more detailed question.',
                mobile: isMobileRequest
            });
        }

        // Get API key from environment variables
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error('OPENROUTER_API_KEY not found in environment variables');
            return res.status(500).json({ 
                error: 'Server configuration error',
                mobile: isMobileRequest
            });
        }

        // ENHANCED: Expanded topics with respectful decline system
        const enhancedSystemPrompt = `You are a wise spiritual guide. Keep responses concise (1-3 sentences). Avoid using 🙏 emoji in responses. Be warm but direct.

SPIRITUAL TOPICS YOU CAN DISCUSS:
- Krishna teachings and Bhagavad Gita wisdom
- Meditation, mindfulness, and spiritual practices
- Self-help and personal development
- Self-realization and consciousness
- Inner peace, stress relief, and emotional well-being
- Life purpose, meaning, and spiritual growth
- Overcoming anxiety, fear, and negative emotions
- Building confidence and self-worth
- Forgiveness, letting go, and healing
- Gratitude, compassion, and love
- Dharma, karma, and spiritual principles
- Devotion, surrender, and faith
- Dealing with suffering and life challenges

TOPICS TO POLITELY DECLINE:
- Politics, current events, news
- Technology, gadgets, technical support
- Entertainment, movies, games, sports
- Medical advice or health diagnoses
- Financial, legal, or business advice
- Relationship counseling (beyond spiritual perspective)
- Academic subjects unrelated to spirituality

If asked about declined topics, respond politely: "I focus specifically on spiritual guidance and self-development. I'd be happy to help you explore [topic] from a spiritual perspective instead. What spiritual question can I assist you with today?"

Keep responses practical, encouraging, and spiritually focused. No lengthy explanations.`;

        // Universal optimization: same approach for all devices
        const systemPrompt = enhancedSystemPrompt;
        const maxTokens = isSlowConnection ? 150 : 200; // Consistent concise responses
        const temperature = 0.65; // Balanced for all devices

        // Prepare messages for API
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...(conversationHistory || []).slice(-8) // Slightly reduced for better performance
        ];

        // Enhanced timeout handling
        const timeoutMs = isMobileRequest ? 15000 : 25000; // Slightly reduced desktop timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            // Make request to OpenRouter API
            const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://meditation-app.vercel.app',
                    'X-Title': '60 Second Meditation - Enhanced Spiritual Guide'
                },
                body: JSON.stringify({
                    model: 'mistralai/mistral-small-3.2-24b-instruct:free',
                    messages: messages,
                    temperature: temperature,
                    max_tokens: maxTokens,
                    top_p: 0.85, // Optimized for all devices
                    frequency_penalty: 0.1,
                    presence_penalty: 0.1
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                console.error('OpenRouter API error:', apiResponse.status, errorText);
                
                const errorMessage = isMobileRequest ? 
                    'Connection issue. Please try again.' :
                    'Unable to connect to spiritual guidance. Please try again.';
                    
                return res.status(500).json({ 
                    error: errorMessage,
                    mobile: isMobileRequest,
                    statusCode: apiResponse.status
                });
            }

            const data = await apiResponse.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                console.error('Unexpected API response format:', data);
                return res.status(500).json({ 
                    error: 'Invalid response format',
                    mobile: isMobileRequest
                });
            }

            let aiResponse = data.choices[0].message.content.trim();

            // ENHANCED: Response processing for all devices
            // Remove excessive 🙏 emojis (keep only if at start of response)
            if (aiResponse.includes('🙏')) {
                const lines = aiResponse.split('\n');
                aiResponse = lines.map((line, index) => {
                    if (index === 0) return line; // Keep first line as is
                    return line.replace(/🙏\s*/g, ''); // Remove from other lines
                }).join('\n');
            }

            // Ensure concise responses for all devices
            if (aiResponse.length > 350) {
                const sentences = aiResponse.split(/[.!?]+/);
                aiResponse = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '');
            }

            // Add subtle line breaks for readability
            aiResponse = aiResponse.replace(/\. ([A-Z])/g, '.\n\n$1');

            // Clean up any double emojis or excessive formatting
            aiResponse = aiResponse.replace(/🙏\s*🙏/g, '🙏').trim();

            console.log(`Optimized response - Mobile: ${isMobileRequest}, Length: ${aiResponse.length}`);

            // Return the response
            res.status(200).json({
                response: aiResponse,
                success: true,
                mobile: isMobileRequest,
                responseLength: aiResponse.length,
                tokensUsed: data.usage?.total_tokens || 0
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                console.error('Request timeout:', timeoutMs);
                return res.status(408).json({ 
                    error: 'Request timeout. Please try again.',
                    mobile: isMobileRequest,
                    timeout: true
                });
            }
            
            throw fetchError;
        }

    } catch (error) {
        console.error('API endpoint error:', error);
        
        // Enhanced error handling
        let errorMessage = 'Service temporarily unavailable';
        let statusCode = 500;
        
        if (error.name === 'AbortError') {
            errorMessage = 'Request timed out. Please try again.';
            statusCode = 408;
        } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
            errorMessage = 'Network connection error. Please check your connection.';
            statusCode = 503;
        } else if (error.message?.includes('API key')) {
            errorMessage = 'Authentication error';
            statusCode = 401;
        }

        res.status(statusCode).json({ 
            error: errorMessage,
            mobile: req.body?.mobile || false,
            code: error.code || 'UNKNOWN_ERROR',
            timestamp: new Date().toISOString()
        });
    }
}

// Helper function to detect mobile from user agent
export function isMobileUserAgent(userAgent) {
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(userAgent || '');
}

// Helper function to estimate connection speed
export function isSlowConnection(req) {
    const connection = req.headers['connection'] || '';
    const via = req.headers['via'] || '';
    const saveData = req.headers['save-data'] === 'on';
    
    return /2G|3G|slow/i.test(connection) || 
           /proxy|compress/i.test(via) || 
           saveData;
}
