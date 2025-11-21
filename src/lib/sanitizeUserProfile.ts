// src/lib/sanitizeUserProfile.ts
import { Timestamp } from "firebase/firestore";
import type { QuizAttempt } from '@/ai/schemas';

/**
 * @fileOverview User Profile and Data Sanitizer
 *
 * This utility function sanitizes objects before they are sent to Firestore or AI flows.
 * It performs key operations:
 * 1. Removes any properties with `undefined` values.
 * 2. Converts `Date` objects or specific date strings into Firestore `Timestamp` objects.
 * 3. Pads missing arrays or fields in a QuizAttempt to ensure it meets a minimum structure before strict validation.
 */

/**
 * A comprehensive sanitizer for QuizAttempt objects before they are validated.
 * This function handles missing fields, incorrect types, and ensures the structure
 * is consistent for AI processing.
 * @param raw - The raw quiz attempt object from Firestore or client.
 * @returns A sanitized QuizAttempt object with all required fields guaranteed.
 */
export function sanitizeQuizAttempt(raw: any): QuizAttempt {
  // Build question array first
  const questionsArray = Array.isArray(raw?.questions)
    ? raw.questions.map((q: any) => ({
        id: String(q?.id ?? Math.random().toString(36).substring(2)),
        question: String(q?.question ?? ""),
        options: Array.isArray(q?.options) ? q.options.map(String) : [],
        correctAnswer: String(q?.correctAnswer ?? ""),
        explanation: String(q?.explanation ?? ""),
      }))
    : [];

  const totalQuestions = questionsArray.length;

  // Build answers array
  const answers: string[] = Array.isArray(raw?.userAnswers) 
    ? raw.userAnswers.map(String) 
    : [];
  
  while (answers.length < totalQuestions) {
    answers.push("");
  }

  // Build timePerQuestion array
  const timePer: number[] = Array.isArray(raw?.timePerQuestion) 
    ? raw.timePerQuestion.map(Number) 
    : [];
  
  while (timePer.length < totalQuestions) {
    timePer.push(0);
  }

  // Build and return the complete object with all required fields
  const sanitized: QuizAttempt = {
    userId: String(raw?.userId ?? ""),
    slotId: String(raw?.slotId ?? ""),
    brand: String(raw?.brand ?? "unknown"),
    format: String(raw?.format ?? "mixed"),
    questions: questionsArray,
    userAnswers: answers.slice(0, totalQuestions),
    score: Number.isFinite(Number(raw?.score)) ? Math.floor(Number(raw?.score)) : 0,
    totalQuestions: totalQuestions,
    timestamp: Number(raw?.timestamp) || Date.now(),
    timePerQuestion: timePer.slice(0, totalQuestions),
    unanswered: raw?.unanswered ?? (totalQuestions - answers.filter((a: string) => a).length),
    reason: raw?.reason ?? undefined,
    source: raw?.source === 'ai' ? 'ai' : 'fallback',
    reviewed: !!raw?.reviewed,
  };

  return sanitized;
}

export function sanitizeUserProfile(data: any): any {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data
      .map(item => sanitizeUserProfile(item))
      .filter((item): item is any => item !== undefined);
  }

  const sanitizedObject: { [key: string]: any } = {};

  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key) && data[key] !== undefined) {
      const value = data[key];

      if (key === 'dob' && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          sanitizedObject[key] = Timestamp.fromDate(date);
        }
      } else if (value instanceof Date) {
        sanitizedObject[key] = Timestamp.fromDate(value);
      } else if (value instanceof Timestamp) {
        sanitizedObject[key] = value;
      } else if (typeof value === 'object' && value !== null) {
        sanitizedObject[key] = sanitizeUserProfile(value);
      } else {
        sanitizedObject[key] = value;
      }
    }
  }

  return sanitizedObject;
}
