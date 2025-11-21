export type AdSlot = 
  | 'T20'      // Cube Face 1
  | 'IPL'      // Cube Face 2
  | 'ODI'      // Cube Face 3
  | 'WPL'      // Cube Face 4
  | 'Test'     // Cube Face 5
  | 'Mixed'    // Cube Face 6
  | 'Q1_Q2'    // Question 1→2
  | 'Q2_Q3'    // Question 2→3
  | 'Q3_Q4'    // Question 3→4 (VIDEO)
  | 'Q4_Q5'    // Question 4→5
  | 'AfterQuiz'; // After Quiz (VIDEO)

export const AD_SLOT_NAMES: Record<AdSlot, string> = {
  T20: 'T20 Cricket',
  IPL: 'IPL League',
  ODI: 'One Day International',
  WPL: 'Womens Premier League',
  Test: 'Test Cricket',
  Mixed: 'Mixed Format',
  Q1_Q2: 'Between Q1-Q2',
  Q2_Q3: 'Between Q2-Q3',
  Q3_Q4: 'Between Q3-Q4 (Video)',
  Q4_Q5: 'Between Q4-Q5',
  AfterQuiz: 'After Quiz (Video)',
};

export const VIDEO_AD_SLOTS: AdSlot[] = ['Q3_Q4', 'AfterQuiz'];
export const CUBE_AD_SLOTS: AdSlot[] = ['T20', 'IPL', 'ODI', 'WPL', 'Test', 'Mixed'];
export const QUIZ_AD_SLOTS: AdSlot[] = ['Q1_Q2', 'Q2_Q3', 'Q3_Q4', 'Q4_Q5', 'AfterQuiz'];
