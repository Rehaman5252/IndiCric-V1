import { QuizData } from './schemas';

// A hard-coded quiz that matches your QuizData schema
export const fallbackQuiz: QuizData = {
  questions: [
    {
      id: 'fb1',
      question: "Who is known as the 'Little Master' in cricket?",
      options: ['Sachin Tendulkar', 'Virat Kohli', 'Ricky Ponting', 'Brian Lara'],
      correctAnswer: 'Sachin Tendulkar', // <-- Changed from correctAnswer
      explanation: 'Sachin Tendulkar is widely regarded as one of the greatest batsmen and is famously nicknamed the "Little Master".',
    },
    {
      id: 'fb2',
      question: 'How many players are there on a cricket team?',
      options: ['10', '11', '12', '9'],
      correctAnswer: '11', // <-- Changed from correctAnswer
      explanation: 'A standard cricket team consists of 11 players on the field at one time.',
    },
    {
      id: 'fb3',
      question: 'What does "LBW" stand for?',
      options: ['Leg Before Wicket', 'Long Ball Wide', 'Leg Behind Wicket', 'Lost Ball Wicket'],
      correctAnswer: 'Leg Before Wicket', // <-- Changed from correctAnswer
      explanation: 'LBW is a common way for a batsman to be dismissed.',
    },
    {
      id: 'fb4',
      question: 'Which country won the first-ever Cricket World Cup in 1975?',
      options: ['Australia', 'India', 'England', 'West Indies'],
      correctAnswer: 'West Indies', // <-- Changed from correctAnswer
      explanation: 'West Indies, led by Clive Lloyd, defeated Australia in the final to win the inaugural tournament.',
    },
    {
      id: 'fb5',
      question: 'What is the maximum number of overs in a T20 match for one side?',
      options: ['50', '20', '40', '10'],
      correctAnswer: '20', // <-- Changed from correctAnswer
      explanation: 'T20 (Twenty20) cricket is a shortened format where each team bats for a maximum of 20 overs.',
    },
  ],
  // title: 'General Cricket Quiz', // <-- This line was removed
};