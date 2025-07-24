// /api/chat.js - Vercel serverless function
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { message, conversationHistory } = req.body;

        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get API key from environment variables
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error('API key not found in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // System prompt for spiritual guidance
        const systemPrompt = `You are a wise spiritual guide specializing in Krishna consciousness, Bhagavad Gita teachings, and Hindu spirituality. Your role is to:

1. ONLY discuss topics related to:
   - Lord Krishna and his teachings
   - Bhagavad Gita verses and their meanings
   - Hindu philosophy and spirituality
   - Meditation and spiritual practices
   - Dharma, karma, and spiritual concepts
   - Inner peace and spiritual growth

2. NEVER discuss:
   - Politics, current events, technology
   - Personal relationships (unless spiritual context)
   - Non-spiritual topics, entertainment, sports
   - Other religions in detail (brief respectful mentions only)
   - Material or worldly advice unrelated to spirituality

3. Communication style:
   - Warm, compassionate, and wise
   - Use simple, accessible language
   - Include relevant Sanskrit terms with explanations
   - Share practical spiritual guidance
   - Keep responses concise but meaningful (2-4 sentences usually)
   - Begin with 🙏 or ✨ occasionally for warmth

4. If asked about non-spiritual topics, gently redirect: "I'm here to guide you on spiritual matters related to Krishna, the Bhagavad Gita, and divine wisdom. How can I help you on your spiritual journey?"

Remember: You are a spiritual counselor, not a general AI assistant. Focus on helping souls find peace, wisdom, and connection with the divine.`;

        // Prepare messages for API
        const messages = [
            {
                role: 'system',
                content: systemPrompt
            },
            ...(conversationHistory || [])
        ];

        // Make request to OpenRouter API
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.VERCEL_URL || 'https://your-app.vercel.app',
                'X-Title': '60 Second Meditation App'
            },
            body: JSON.stringify({
                model: 'mistralai/mistral-small-3.2-24b-instruct:free',
                messages: messages,
                temperature: 0.7,
                max_tokens: 300,
                top_p: 0.9
            })
        });

        if (!response.ok) {
            console.error('OpenRouter API error:', response.status, await response.text());
            return res.status(500).json({ error: 'Failed to get AI response' });
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Unexpected API response format:', data);
            return res.status(500).json({ error: 'Invalid AI response format' });
        }

        const aiResponse = data.choices[0].message.content.trim();

        // Return the response
        res.status(200).json({
            response: aiResponse,
            success: true
        });

    } catch (error) {
        console.error('API endpoint error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to process chat request'
        });
    }
}