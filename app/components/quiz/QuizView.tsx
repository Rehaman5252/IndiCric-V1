'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lightbulb, Loader2, ShieldAlert } from 'lucide-react';
import type { QuizQuestion, HintOutput } from '@/ai/schemas';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

const QUESTION_TIME_LIMIT = 20; // seconds

interface QuizViewProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  onNoBall?: (reason: 'no-ball') => void;
  brand: string;
  format: string;
}

export function QuizView({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onNoBall,
  brand,
  format,
}: QuizViewProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(QUESTION_TIME_LIMIT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Start timer
  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval.current!);
          handleSubmit(selectedAnswer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [selectedAnswer]);

  const handleSubmit = (answer: string | null) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    console.log(`✅ Answer submitted: ${answer || 'No Ball'}`);
    onAnswer(answer || 'no-ball');
  };

  const handleNoBall = () => {
    setIsSubmitting(true);
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    console.log(`🚫 No Ball submitted`);
    onNoBall?.('no-ball');
    onAnswer('no-ball');
  };

  const progressValue = ((QUESTION_TIME_LIMIT - timeRemaining) / QUESTION_TIME_LIMIT) * 100;
  const timeColor = timeRemaining > 10 ? '#10b981' : timeRemaining > 5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            Question {questionNumber} of {totalQuestions}
          </Badge>
          <span className="text-xs text-gray-400">
             {format}
          </span>
        </div>

        {/* Progress Bar */}
        <Progress
          value={(questionNumber / totalQuestions) * 100}
          className="h-1 bg-gray-700"
        />
      </div>

      {/* Timer Circle */}
      <div className="flex justify-center">
        <div className="w-24 h-24">
          <CircularProgressbar
            value={progressValue}
            text={`${timeRemaining}s`}
            styles={buildStyles({
              rotation: 0,
              strokeLinecap: 'round',
              textSize: '20px',
              pathTransitionDuration: 1,
              pathColor: timeColor,
              textColor: timeColor,
              trailColor: '#374151',
            })}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="bg-gray-900 border-gray-700 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-bold text-white mb-6">{question.question}</h2>

          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => !isSubmitting && setSelectedAnswer(option)}
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={cn(
                  'w-full p-4 text-left rounded-lg font-medium transition-all duration-200',
                  selectedAnswer === option
                    ? 'bg-blue-600 text-white border-2 border-blue-400'
                    : 'bg-gray-800 text-gray-100 border-2 border-gray-700 hover:border-gray-600',
                  isSubmitting && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                      selectedAnswer === option
                        ? 'bg-blue-400 border-blue-200'
                        : 'border-gray-600'
                    )}
                  >
                    {selectedAnswer === option && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {/* Submit Button */}
        <Button
          onClick={() => handleSubmit(selectedAnswer)}
          disabled={!selectedAnswer || isSubmitting}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            `Submit Answer`
          )}
        </Button>

        {/* No Ball Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleNoBall}
                disabled={isSubmitting}
                variant="outline"
                className="border-yellow-600 text-yellow-600 hover:bg-yellow-600/10"
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                No Ball
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click if the question is invalid or ambiguous</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Question Details */}
      {question.explanation && (
        <Card className="bg-blue-900/20 border-blue-700/30 p-4">
          <p className="text-sm text-blue-300">{question.explanation}</p>
        </Card>
      )}
    </div>
  );
}

export default QuizView;
