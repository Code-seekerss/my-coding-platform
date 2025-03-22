import { GoogleGenerativeAI } from '@google/generative-ai';

// Make sure you have NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export interface CodeAnalysis {
  suggestions: string[];
  improvements: string[];
  security: string[];
  explanation: string;
}

function extractJSONFromMarkdown(text: string): string {
  // Try to find JSON content between code blocks
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1];
  }
  
  // If no code blocks, try to find a JSON object directly
  const objectMatch = text.match(/\{[\s\S]*?\}/);
  if (objectMatch) {
    return objectMatch[0];
  }
  
  throw new Error('No JSON found in response');
}

export async function analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
  try {
    // Using Gemini 2.0 Flash - the latest model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyze the following ${language} code and provide a response in JSON format only (no additional text or markdown) with the following structure:
{
  "suggestions": ["suggestion1", "suggestion2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "security": ["security1", "security2", ...],
  "explanation": "brief explanation"
}

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      // First try direct JSON parse
      return JSON.parse(text) as CodeAnalysis;
    } catch (e) {
      // If direct parse fails, try to extract JSON from markdown
      try {
        const jsonStr = extractJSONFromMarkdown(text);
        return JSON.parse(jsonStr) as CodeAnalysis;
      } catch (e2) {
        console.error('Failed to parse Gemini response:', e2);
        console.log('Raw response:', text);
        return {
          suggestions: ['Unable to parse the analysis response'],
          improvements: [],
          security: [],
          explanation: 'Failed to parse the AI response. Please try again.'
        };
      }
    }
  } catch (error) {
    console.error('Error analyzing code:', error);
    if (error instanceof Error) {
      return {
        suggestions: [`Error analyzing code: ${error.message}`],
        improvements: [],
        security: [],
        explanation: 'Analysis failed due to API error'
      };
    }
    return {
      suggestions: ['Error analyzing code'],
      improvements: [],
      security: [],
      explanation: 'Analysis failed'
    };
  }
} 