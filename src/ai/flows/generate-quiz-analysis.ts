'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { QuizAttempt, QuizAnalysisOutput, QuizAnalysisOutputSchema } from '@/ai/schemas';
import { sanitizeQuizAttempt } from '@/lib/sanitizeUserProfile';

const FALLBACK_ANALYSIS: QuizAnalysisOutput = {
  summary: "We couldn’t generate an AI analysis this time, so here are general insights based on typical quiz performance.",
  strengths: [
    "You completed the quiz – great consistency!",
    "You’re building recall under time pressure.",
  ],
  weaknesses: [
    "Occasional hesitation on trick questions.",
    "Some gaps in fundamentals surfaced.",
  ],
  recommendations: [
    "Revisit questions you answered incorrectly and note why.",
    "Practice with shorter, timed sets to improve pace.",
    "Review one focused topic each day for a week.",
  ],
  source: "fallback",
};

export async function generateQuizAnalysis(rawAttempt: any): Promise<QuizAnalysisOutput> {
    const sanitized = sanitizeQuizAttempt(rawAttempt);
    if (!sanitized) {
        console.error(`[Analysis] Sanitization failed for quiz attempt. Returning fallback.`);
        return FALLBACK_ANALYSIS;
    }
    try {
        const validatedAttempt = QuizAttempt.parse(sanitized);
        const analysis = await generateQuizAnalysisFlow({ attempt: validatedAttempt });
        return analysis;
    } catch (error: any) {
        console.error(`[Analysis] Validation failed for quiz attempt. Returning fallback.`, {
            userId: sanitized.userId,
            slotId: sanitized.slotId,
            error: error?.errors ?? error,
        });
        return FALLBACK_ANALYSIS;
    }
}

const quizAnalysisPrompt = ai.definePrompt({
    name: 'generateQuizAnalysisPrompt',
    input: { schema: z.object({ attempt: QuizAttempt }) },
    output: { schema: QuizAnalysisOutputSchema },
    prompt: `
    You are an expert cricket quiz analyst and coach. Your goal is to provide an insightful, detailed, and helpful performance analysis for a user based on their recent quiz attempt. Be encouraging but also provide concrete, actionable feedback.

    Analyze the following quiz data for the "{{attempt.format}}" format:
    - Score: {{attempt.score}} out of {{attempt.totalQuestions}}
    - Questions, User Answers, and Time Taken:
      {{#each attempt.questions}}
      - Q{{@index + 1}}: {{this.question}}
        - Your Answer: {{../attempt.userAnswers.[@index]}}
        - Correct Answer: {{this.correctAnswer}}
        - Time Taken: {{../attempt.timePerQuestion.[@index]}}s
      {{/each}}

    Return STRICTLY a JSON object that matches this shape:
    {
      "summary": string,            // concise overall insight
      "strengths": string[],        // bullet points of strengths
      "weaknesses": string[],       // bullet points of weaknesses
      "recommendations": string[],  // actionable next steps
      "source": "ai"
    }
  `,
});

export const generateQuizAnalysisFlow = ai.defineFlow(
    {
        name: 'generateQuizAnalysisFlow',
        inputSchema: z.object({ attempt: QuizAttempt }),
        outputSchema: QuizAnalysisOutputSchema,
    },
    async ({ attempt }) => {
        try {
            const { output } = await quizAnalysisPrompt({ attempt });
            const parsed = QuizAnalysisOutputSchema.safeParse(output);
            if (!parsed.success) {
                console.error(
                    "[generateQuizAnalysisFlow] Schema validation failed:",
                    parsed.error?.format?.() ?? parsed.error
                );
                return FALLBACK_ANALYSIS;
            }
            return { ...parsed.data, source: "ai" } as QuizAnalysisOutput;
        } catch (err) {
            console.error("[generateQuizAnalysisFlow] Unexpected error:", err);
            return FALLBACK_ANALYSIS;
        }
    }
);
