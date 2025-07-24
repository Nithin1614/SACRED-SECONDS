// /api/chat.js - Mobile-Optimized Vercel serverless function
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

        // Rate limiting for mobile (simpler check)
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

        // OPTIMIZED: Universal concise system prompt for ALL devices
        const universalSystemPrompt = `You are a wise Krishna consciousness guide. Keep responses concise (1-3 sentences). Focus on Krishna, Bhagavad Gita, and spiritual wisdom only. Use 🙏 occasionally. Be warm and practical.

ONLY discuss: Krishna teachings, Bhagavad Gita, meditation, spiritual growth, dharma, karma, inner peace.
NEVER discuss: politics, technology, entertainment, non-spiritual topics.

If asked about non-spiritual topics, redirect: "I'm here for spiritual guidance about Krishna and divine wisdom. How can I help your spiritual journey?"`;

        // OPTIMIZED: Use same concise prompt for all devices
        const systemPrompt = universalSystemPrompt;

        // OPTIMIZED: Same token limits for all devices (desktop now gets same as mobile)
        const maxTokens = isSlowConnection ? 150 : 200; // No more 300 tokens for desktop
        const temperature = isMobileRequest ? 0.6 : 0.7; // Keep slight temperature difference

        // Prepare messages for API with mobile optimization
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...(conversationHistory || []).slice(-10) // Limit history for mobile performance
        ];

        // Enhanced timeout handling for mobile
        const timeoutMs = isMobileRequest ? 15000 : 30000;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            // Make request to OpenRouter API with mobile optimizations
            const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://meditation-app.vercel.app',
                    'X-Title': '60 Second Meditation - Universally Optimized'
                },
                body: JSON.stringify({
                    model: 'mistralai/mistral-small-3.2-24b-instruct:free',
                    messages: messages,
                    temperature: temperature,
                    max_tokens: maxTokens,
                    top_p: isMobileRequest ? 0.8 : 0.9,
                    frequency_penalty: 0.1,
                    presence_penalty: 0.1
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                console.error('OpenRouter API error:', apiResponse.status, errorText);
                
                // Mobile-friendly error messages
                const errorMessage = isMobileRequest ? 
                    'Connection issue. Please try again.' :
                    'Failed to get spiritual guidance. Please try again in a moment.';
                    
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
                    error: isMobileRequest ? 'Invalid response format' : 'Invalid AI response format',
                    mobile: isMobileRequest
                });
            }

            let aiResponse = data.choices[0].message.content.trim();

            // OPTIMIZED: Apply same response processing to ALL devices (not just mobile)
            // Ensure response isn't too long for ANY device
            if (aiResponse.length > 400) {
                const sentences = aiResponse.split(/[.!?]+/);
                aiResponse = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');
            }

            // Add line breaks for better readability on ALL devices
            aiResponse = aiResponse.replace(/\. ([A-Z])/g, '.\n\n$1');

            // Log successful response
            console.log(`Successful response - Mobile: ${isMobileRequest}, Length: ${aiResponse.length}`);

            // Return the response with metadata
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
                    error: isMobileRequest ? 'Request timeout. Please try again.' : 'Request timed out. Please try again.',
                    mobile: isMobileRequest,
                    timeout: true
                });
            }
            
            throw fetchError; // Re-throw other errors
        }

    } catch (error) {
        console.error('API endpoint error:', error);
        
        // Enhanced error handling with mobile considerations
        let errorMessage = 'Internal server error';
        let statusCode = 500;
        
        if (error.name === 'AbortError') {
            errorMessage = req.body?.mobile ? 'Request timeout' : 'Request timed out. Please try again.';
            statusCode = 408;
        } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
            errorMessage = req.body?.mobile ? 'Network error' : 'Network connection error. Please check your connection.';
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

// Helper function to detect mobile from user agent (exported for potential reuse)
export function isMobileUserAgent(userAgent) {
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(userAgent || '');
}

// Helper function to estimate connection speed (basic)
export function isSlowConnection(req) {
    const connection = req.headers['connection'] || '';
    const via = req.headers['via'] || '';
    const saveData = req.headers['save-data'] === 'on';
    
    return /2G|3G|slow/i.test(connection) || 
           /proxy|compress/i.test(via) || 
           saveData;
}
