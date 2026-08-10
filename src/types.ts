export type Language = "en" | "es" | "fr";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface LessonData {
  title: string;
  gradeLevel: string;
  topic: string;
  storySession: string;
  keyConcepts: string[];
  quiz: QuizQuestion[];
  illustrationKeyword?: string;
  galleryMetadata?: {
    characterDescription?: string;
    settingDescription?: string;
    actionDescription?: string;
  };
}

export interface ScorePlayRecord {
  id: string;
  topic: string;
  gradeLevel: string;
  timestamp: string;
  childName: string;
  score: number;
  totalQuestions: number;
  history: {
    question: string;
    selectedOption: string;
    correctOption: string;
    isCorrect: boolean;
  }[];
}

export interface AtHomeActivity {
  title: string;
  intro: string;
  materialsNeeded: string[];
  instructions: string[];
  parentProTip: string;
}

export interface CoLearningChallenge {
  conceptMastering: string;
  challengeTitle: string;
  householdItems: string[];
  parentScript: string[];
  reflectionPrompt: string;
}

export interface ParentInsights {
  overallFeedback: string;
  struggleKeywords: string[];
  atHomeActivities: AtHomeActivity[];
  coLearningChallenge?: CoLearningChallenge;
}
