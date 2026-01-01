// /api/chat.js - Fixed with WORKING free models from OpenRouter
export default async function handler(req, res) {
    // Enhanced CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent, X-Requested-With, Accept');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed'
        });
    }

    try {
        const { message, conversationHistory = [] } = req.body;
        
        console.log('=== DEBUG INFO ===');
        console.log('Message received:', message);
        console.log('Env vars available:', Object.keys(process.env).filter(k => k.includes('OPENROUTER')));
        
        // Validate message
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ 
                error: 'Message is required'
            });
        }

        if (message.length > 500) {
            return res.status(400).json({ 
                error: 'Message too long. Please keep it under 500 characters.'
            });
        }

        // Get API key
        const apiKey = process.env.OPENROUTER_API_KEY || 
                       process.env.NEXT_PUBLIC_OPENROUTER_API_KEY ||
                       process.env.OPENROUTER_KEY;
        
        console.log('API Key found:', apiKey ? `Yes (${apiKey.substring(0, 10)}...)` : 'No');
        
        if (!apiKey) {
            console.error('CRITICAL: No API key found in environment');
            return res.status(500).json({ 
                error: 'Server configuration error: API key not configured'
            });
        }

        const systemPrompt = `You are a wise spiritual guide. Keep responses concise (1-3 sentences). Avoid using 🙏 emoji in responses. Be warm but direct.

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

If asked about declined topics, respond politely: "I focus specifically on spiritual guidance and self-development. What spiritual question can I assist you with today?"

Keep responses practical, encouraging, and spiritually focused.`;

        // Prepare messages
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...conversationHistory.slice(-8),
            {
                role: 'user',
                content: message
            }
        ];

        console.log('Sending request to OpenRouter...');

        // Make request with better error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
            const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': process.env.VERCEL_URL || 'https://your-app.vercel.app',
                    'X-Title': 'Spiritual Guide Chat'
                },
                body: JSON.stringify({
                    // VERIFIED WORKING FREE MODELS (Choose ONE):
                    // Best for spiritual guidance (recommended):
                   // model: 'google/gemini-2.0-flash-exp:free',  // Fast, smart, great for conversation
                    
                    // Alternative options (uncomment to use):
                     model: 'meta-llama/llama-3.3-70b-instruct:free',  // Very good, slightly slower
                    // model: 'deepseek/deepseek-chat-v3.1:free',  // Good for coding & technical
                    // model: 'deepseek/deepseek-r1:free',  // Advanced reasoning
                    // model: 'google/gemma-3-27b-it:free',  // Balanced performance
                    // model: 'meta-llama/llama-4-scout:free',  // Latest from Meta
                    
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 200
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('OpenRouter response status:', apiResponse.status);

            // Check response status
            if (!apiResponse.ok) {
                const errorText = await apiResponse.text();
                console.error('OpenRouter API error:', {
                    status: apiResponse.status,
                    statusText: apiResponse.statusText,
                    body: errorText
                });
                
                return res.status(apiResponse.status).json({ 
                    error: `API Error: ${apiResponse.statusText}`,
                    details: errorText,
                    status: apiResponse.status
                });
            }

            const data = await apiResponse.json();
            console.log('API response received successfully');
            
            if (!data.choices?.[0]?.message?.content) {
                console.error('Invalid response structure:', JSON.stringify(data));
                return res.status(500).json({ 
                    error: 'Invalid API response format',
                    debug: data
                });
            }

            let aiResponse = data.choices[0].message.content.trim();

            // Clean up response
            if (aiResponse.includes('🙏')) {
                const lines = aiResponse.split('\n');
                aiResponse = lines.map((line, index) => {
                    if (index === 0) return line;
                    return line.replace(/🙏\s*/g, '');
                }).join('\n');
            }

            // Ensure conciseness
            if (aiResponse.length > 350) {
                const sentences = aiResponse.split(/[.!?]+/).filter(s => s.trim());
                aiResponse = sentences.slice(0, 2).join('. ') + '.';
            }

            aiResponse = aiResponse.replace(/🙏\s*🙏/g, '🙏').trim();

            console.log('Response sent successfully, length:', aiResponse.length);

            return res.status(200).json({
                response: aiResponse,
                success: true,
                tokensUsed: data.usage?.total_tokens || 0
            });

        } catch (fetchError) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                console.error('Request timeout after 30s');
                return res.status(408).json({ 
                    error: 'Request timeout. Please try again.',
                    timeout: true
                });
            }
            
            console.error('Fetch error:', fetchError);
            throw fetchError;
        }

    } catch (error) {
        console.error('=== CRITICAL ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        let errorMessage = 'Service temporarily unavailable';
        let statusCode = 500;
        
        if (error.name === 'AbortError') {
            errorMessage = 'Request timed out';
            statusCode = 408;
        } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
            errorMessage = 'Network connection error';
            statusCode = 503;
        }

        return res.status(statusCode).json({ 
            error: errorMessage,
            debug: {
                name: error.name,
                message: error.message,
                code: error.code
            },
            timestamp: new Date().toISOString()
        });
    }
}
