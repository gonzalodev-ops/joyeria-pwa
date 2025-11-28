// @deno-types="https://deno.land/std@0.168.0/http/server.ts"
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { imageData, mimeType } = await req.json()

        if (!imageData || !mimeType) {
            return new Response(
                JSON.stringify({ error: 'Missing imageData or mimeType' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!GEMINI_API_KEY) {
            return new Response(
                JSON.stringify({ error: 'Gemini API key not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Call Gemini API
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: 'Analyze this jewelry image and suggest specific lighting enhancements to make it look more premium. Focus on reflections, contrast, and color balance for silver and crystals. Keep it concise.',
                                },
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: imageData,
                                    },
                                },
                            ],
                        },
                    ],
                }),
            }
        )

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text()
            console.error('Gemini API error:', errorText)
            console.error('Status:', geminiResponse.status)
            console.error('API Key prefix:', GEMINI_API_KEY?.substring(0, 10))
            return new Response(
                JSON.stringify({
                    error: 'Failed to analyze image',
                    details: errorText,
                    status: geminiResponse.status
                }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const data = await geminiResponse.json()
        const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available'

        return new Response(
            JSON.stringify({ analysis: analysisText }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Error in analyze-image function:', error)
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
