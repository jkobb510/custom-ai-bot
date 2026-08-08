import { GoogleGenAI } from '@google/genai';
import { validateResponse } from '@/lib/responseValidator';

export async function POST(request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required and must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY environment variable is missing in .env.local' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Call Google Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: message,
    });

    // Extract the text response
    const aiResponse = response.text || '';

    if (!aiResponse) {
      return new Response(
        JSON.stringify({ error: 'No response from API' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate and clean the response
    const validationResult = validateResponse(aiResponse);

    return new Response(
      JSON.stringify({
        success: true,
        original: validationResult.original,
        cleaned: validationResult.cleaned,
        passed: validationResult.passed,
        foundPhrases: validationResult.foundPhrases || [],
        message: validationResult.message,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
