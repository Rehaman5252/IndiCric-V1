'use server';

import { googleAI_SDK, MODEL_NAME } from '@/ai/genkit';

interface HintInput {
  question: string;
  correctAnswer: string;
}

export async function generateHint(input: HintInput): Promise<string> {
  console.log('[generateHint] 🔍 Generating hint for question...');
  
  try {
    const model = googleAI_SDK.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        temperature: 0.7,
        topK: 20,
        topP: 0.9,
        maxOutputTokens: 200,
      },
    });

    const prompt = `You are a helpful cricket quiz assistant. Generate a subtle hint for this question WITHOUT revealing the answer directly.

Question: "${input.question}"

Rules:
- Don't mention the answer "${input.correctAnswer}" directly
- Give a clue related to the context (era, team, achievement, etc.)
- Keep it under 25 words
- Be encouraging and helpful
- Mention related facts that guide thinking

Generate ONLY the hint text, no extra formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const hint = response.text().trim();

    console.log('[generateHint] ✅ Hint generated successfully');
    return hint;
  } catch (error: any) {
    console.error('[generateHint] ❌ Error:', error?.message || error);
    
    // Fallback hint
    return `Think about the context of "${input.question.slice(0, 30)}..." - consider the era, team, or specific achievements mentioned.`;
  }
}
