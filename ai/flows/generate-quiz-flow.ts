'use server';

import { googleAI_SDK, MODEL_NAME } from '@/ai/genkit';
import { z } from 'zod';
import { QuizData } from '@/ai/schemas';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

const GenerateQuizInputSchema = z.object({
    format: z.string().describe('The cricket format for the quiz'),
    userId: z.string().describe('The ID of the user requesting the quiz'),
});
type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const getRecentQuestions = async (userId: string): Promise<string[]> => {
    if (!db) {
        console.log("[getRecentQuestions] Database not initialized");
        return [];
    }
    
    try {
        const q = query(
            collection(db, 'users', userId, 'quizAttempts'),
            orderBy('timestamp', 'desc'),
            limit(5)
        );
        const querySnapshot = await getDocs(q);
        const seenQuestions = new Set<string>();
        querySnapshot.forEach(doc => {
            const attempt = doc.data();
            if (attempt.questions) {
                attempt.questions.forEach((question: any) => {
                    if(question && typeof question.question === 'string') {
                      seenQuestions.add(question.question);
                    }
                });
            }
        });
        return Array.from(seenQuestions);
    } catch (error: any) {
        if (error?.code !== 'permission-denied') {
            console.error("[getRecentQuestions] Error:", error);
        }
        return [];
    }
}

// Generate prompt text
function buildPrompt(format: string, seenQuestions: string[]): string {
  const seenQuestionsText = seenQuestions.length > 0 
    ? seenQuestions.map(q => `- "${q}"`).join('\n')
    : '(No recent questions)';

  return `
You are a world-class cricket expert and quizmaster. Generate a completely new 5-question multiple-choice quiz about "${format}" cricket.

## Rule 1: Progressive Difficulty
- Question 1 (Easy): Casual fan knowledge
- Question 2 (Medium): More than surface level  
- Question 3 (Difficult): Specific records or stats
- Question 4 (Very Hard): Obscure facts or historical events
- Question 5 (Extremely Hard): Expert-level trivia

## Rule 2: Balanced Topic Coverage
Pull questions from various topics: players, teams, records, tournaments, rules, historical moments.

## Rule 3: Output Format
Return a valid JSON object with this EXACT structure:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation"
    }
  ]
}

## Rule 4: Avoid Repetition
Do NOT generate questions similar to these recently seen ones:
${seenQuestionsText}

## IMPORTANT:
- Make sure all 4 options are plausible
- The correct answer must EXACTLY match one of the 4 options
- Keep questions clear and unambiguous
- Format should be "${format}" cricket specific
- Return ONLY valid JSON, no markdown formatting

Generate the 5-question quiz now in JSON format.
`;
}

export async function generateQuizFlow(input: GenerateQuizInput): Promise<z.infer<typeof QuizData>> {
    console.log(`[generateQuizFlow] 🎯 Starting for format: ${input.format}`);
    
    const seenQuestions = await getRecentQuestions(input.userId);
    console.log(`[generateQuizFlow] 📚 Found ${seenQuestions.length} recent questions`);

    try {
        console.log(`[generateQuizFlow] 🤖 Calling Gemini AI with model: ${MODEL_NAME}...`);
        
        const model = googleAI_SDK.getGenerativeModel({ 
          model: MODEL_NAME,
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        });

        const prompt = buildPrompt(input.format, seenQuestions);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`[generateQuizFlow] ✅ AI response received`);
        
        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in AI response");
        }
        
        const parsedData = JSON.parse(jsonMatch[0]);
        const validation = QuizData.safeParse(parsedData);
        
        if (!validation.success) {
             console.error("[generateQuizFlow] ❌ Validation failed:", validation.error.format());
             throw new Error("AI returned invalid quiz data");
        }

        console.log(`[generateQuizFlow] ✅ SUCCESS: Generated ${validation.data.questions.length} questions`);
        return validation.data;
        
    } catch (error: any) {
        console.error("[generateQuizFlow] ❌ Error:", error?.message || error);
        throw error;
    }
}
