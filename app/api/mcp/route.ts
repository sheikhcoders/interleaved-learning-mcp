import { z } from 'zod';
import { createMcpHandler } from 'mcp-handler';

// Types for better type safety
interface StudySession {
  userId: string;
  subject: string;
  duration: number;
  date: string;
  quizScore?: number;
}

interface Flashcard {
  front: string;
  back: string;
  topic: string;
}

interface FlashcardDeck {
  name: string;
  cards: Flashcard[];
}

interface SubjectStats {
  totalMinutes: number;
  sessions: number;
  avgScore?: number;
}

// In-memory storage (for demo - use database in production)
const studyLogs: StudySession[] = [];
const flashcardDecks = new Map<string, FlashcardDeck>();

// Interleaving patterns with research-backed descriptions
const INTERLEAVING_PATTERNS = {
  ABAB: {
    name: 'Simple Alternation',
    description: 'Alternate between two subjects (A→B→A→B)',
    difficulty: 'beginner',
    bestFor: 'Starting with interleaving, 2 related subjects'
  },
  ABCABC: {
    name: 'Triple Rotation',
    description: 'Rotate through three subjects (A→B→C→A→B→C)',
    difficulty: 'intermediate',
    bestFor: 'Balanced multi-subject study'
  },
  ABACBC: {
    name: 'Spaced Mixing',
    description: 'Mix with strategic spacing for retention',
    difficulty: 'intermediate',
    bestFor: 'When one subject needs more reinforcement'
  },
  Random: {
    name: 'Random Shuffle',
    description: 'Randomly shuffle all topics for maximum interleaving',
    difficulty: 'advanced',
    bestFor: 'Exam prep, maximizing discrimination learning'
  },
  'Blocked-to-Interleaved': {
    name: 'Gradual Transition',
    description: 'Start blocked, gradually increase interleaving',
    difficulty: 'beginner',
    bestFor: 'Learning new concepts before mixing'
  }
} as const;

type PatternKey = keyof typeof INTERLEAVING_PATTERNS;

// Utility functions
const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const generateSchedule = (subjects: string[], pattern: PatternKey): string[] => {
  const scheduleGenerators: Record<PatternKey, () => string[]> = {
    ABAB: () => Array.from({ length: 4 }, (_, i) => subjects[i % subjects.length]),
    ABCABC: () => Array.from({ length: 6 }, (_, i) => subjects[i % subjects.length]),
    ABACBC: () => [
      subjects[0], subjects[1], subjects[0],
      subjects[2] || subjects[1], subjects[1], subjects[2] || subjects[0]
    ],
    Random: () => shuffle([...subjects, ...subjects]),
    'Blocked-to-Interleaved': () => [...subjects, ...shuffle([...subjects])]
  };
  return scheduleGenerators[pattern]();
};

const createResponse = (data: object) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }]
});

// MCP Handler
const handler = createMcpHandler(
  (server) => {
    // Tool 1: Create Study Plan
    server.tool(
      'create_study_plan',
      'Generate an interleaved study schedule. Alternates between topics based on cognitive science research for optimal retention.',
      {
        subjects: z.array(z.string()).min(2).max(6).describe('Subjects to study (2-6 items)'),
        totalMinutes: z.number().min(20).max(240).describe('Total study time (20-240 min)'),
        pattern: z.enum(['ABAB', 'ABCABC', 'ABACBC', 'Random', 'Blocked-to-Interleaved']).optional()
          .describe('Interleaving pattern (default: ABAB)')
      },
      async ({ subjects, totalMinutes, pattern = 'ABAB' }) => {
        const schedule = generateSchedule(subjects, pattern);
        const blockDuration = Math.floor(totalMinutes / schedule.length);
        const patternInfo = INTERLEAVING_PATTERNS[pattern];

        return createResponse({
          success: true,
          plan: {
            pattern: patternInfo.name,
            description: patternInfo.description,
            bestFor: patternInfo.bestFor,
            totalMinutes,
            blocks: schedule.map((subject, i) => ({
              order: i + 1,
              subject,
              duration: blockDuration,
              startAt: `${i * blockDuration} min`
            })),
            tips: [
              'Take 2-min breaks between blocks',
              'Briefly review previous topic before switching',
              'Embrace the difficulty—it enhances learning!'
            ]
          }
        });
      }
    );

    // Tool 2: Generate Interleaved Quiz
    server.tool(
      'generate_interleaved_quiz',
      'Create a mixed-topic quiz. Interleaved questions force your brain to identify which strategy applies, strengthening learning.',
      {
        topics: z.array(z.object({
          name: z.string(),
          questions: z.array(z.object({
            question: z.string(),
            options: z.array(z.string()).min(2).max(5),
            correctIndex: z.number()
          })).min(1)
        })).min(2).describe('Topics with questions (min 2 topics)'),
        questionsPerTopic: z.number().min(1).max(10).optional().describe('Questions per topic (default: 3)')
      },
      async ({ topics, questionsPerTopic = 3 }) => {
        const allQuestions = topics.flatMap(topic =>
          topic.questions.slice(0, questionsPerTopic).map(q => ({ topic: topic.name, ...q }))
        );

        return createResponse({
          success: true,
          quiz: {
            totalQuestions: allQuestions.length,
            topicsCovered: topics.map(t => t.name),
            questions: shuffle(allQuestions).map((q, i) => ({ number: i + 1, ...q })),
            tip: 'First identify which topic each question belongs to—this strengthens category learning!'
          }
        });
      }
    );

    // Tool 3: Create Flashcard Deck
    server.tool(
      'create_flashcard_deck',
      'Create a multi-topic flashcard deck. Cards from different topics will be shuffled for interleaved practice.',
      {
        deckName: z.string().min(1).max(50).describe('Deck name'),
        cards: z.array(z.object({
          front: z.string().min(1),
          back: z.string().min(1),
          topic: z.string().min(1)
        })).min(2).describe('Flashcards with front, back, and topic')
      },
      async ({ deckName, cards }) => {
        flashcardDecks.set(deckName, { name: deckName, cards });

        const topicCounts = cards.reduce<Record<string, number>>((acc, card) => {
          acc[card.topic] = (acc[card.topic] || 0) + 1;
          return acc;
        }, {});

        return createResponse({
          success: true,
          deck: {
            name: deckName,
            totalCards: cards.length,
            topics: Object.entries(topicCounts).map(([topic, count]) => ({ topic, count })),
            message: `Created "${deckName}" with ${cards.length} cards across ${Object.keys(topicCounts).length} topics`
          }
        });
      }
    );

    // Tool 4: Get Shuffled Flashcards
    server.tool(
      'get_shuffled_flashcards',
      'Get flashcards in shuffled order. Interleaved review improves long-term retention.',
      {
        deckName: z.string().describe('Deck name'),
        count: z.number().min(1).max(50).optional().describe('Number of cards (default: all)')
      },
      async ({ deckName, count }) => {
        const deck = flashcardDecks.get(deckName);

        if (!deck) {
          const available = Array.from(flashcardDecks.keys());
          return createResponse({
            success: false,
            error: `Deck "${deckName}" not found`,
            availableDecks: available.length ? available : 'No decks created yet'
          });
        }

        const cards = shuffle(deck.cards).slice(0, count || deck.cards.length);

        return createResponse({
          success: true,
          deckName,
          totalInDeck: deck.cards.length,
          cards: cards.map((card, i) => ({ number: i + 1, ...card })),
          tip: 'Try to recall before flipping. Struggling is part of learning!'
        });
      }
    );

    // Tool 5: Log Study Session
    server.tool(
      'log_study_session',
      'Record a study session. Tracking helps identify patterns and optimize your learning.',
      {
        userId: z.string().min(1).describe('Your user ID'),
        subject: z.string().min(1).describe('Subject studied'),
        duration: z.number().min(1).max(480).describe('Duration in minutes'),
        quizScore: z.number().min(0).max(100).optional().describe('Quiz score if taken')
      },
      async ({ userId, subject, duration, quizScore }) => {
        const session: StudySession = {
          userId,
          subject,
          duration,
          date: new Date().toISOString(),
          quizScore
        };
        studyLogs.push(session);

        const userTotal = studyLogs
          .filter(log => log.userId === userId)
          .reduce((sum, log) => sum + log.duration, 0);

        return createResponse({
          success: true,
          logged: session,
          stats: {
            totalStudyTime: `${userTotal} minutes`,
            message: quizScore !== undefined
              ? `Logged ${duration}min of ${subject} with ${quizScore}% score`
              : `Logged ${duration}min of ${subject}`
          }
        });
      }
    );

    // Tool 6: Get Learning Progress
    server.tool(
      'get_learning_progress',
      'View your learning statistics and get personalized recommendations.',
      {
        userId: z.string().min(1).describe('Your user ID')
      },
      async ({ userId }) => {
        const userLogs = studyLogs.filter(log => log.userId === userId);

        if (!userLogs.length) {
          return createResponse({
            success: true,
            progress: null,
            message: 'No sessions yet. Start studying to track progress!'
          });
        }

        const stats = userLogs.reduce<Record<string, SubjectStats>>((acc, log) => {
          if (!acc[log.subject]) {
            acc[log.subject] = { totalMinutes: 0, sessions: 0 };
          }
          acc[log.subject].totalMinutes += log.duration;
          acc[log.subject].sessions += 1;

          if (log.quizScore !== undefined) {
            const subjectLogs = userLogs.filter(l => l.subject === log.subject && l.quizScore !== undefined);
            acc[log.subject].avgScore = Math.round(
              subjectLogs.reduce((sum, l) => sum + (l.quizScore || 0), 0) / subjectLogs.length
            );
          }
          return acc;
        }, {});

        const subjects = Object.keys(stats);
        const totalMinutes = userLogs.reduce((sum, log) => sum + log.duration, 0);
        const weakest = subjects.reduce((a, b) =>
          (stats[a].avgScore ?? 100) < (stats[b].avgScore ?? 100) ? a : b
        );

        const recommendations = [
          subjects.length < 3
            ? '📚 Add more subjects to maximize interleaving benefits'
            : '✅ Great variety of subjects!',
          stats[weakest]?.avgScore !== undefined && stats[weakest].avgScore! < 70
            ? `🎯 Focus more on ${weakest} (lowest score: ${stats[weakest].avgScore}%)`
            : '✅ Balanced performance across subjects!',
          totalMinutes < 120
            ? '⏱️ Aim for 2+ hours of total weekly study'
            : '✅ Strong study consistency!'
        ];

        return createResponse({
          success: true,
          progress: {
            totalSessions: userLogs.length,
            totalMinutes,
            subjects: Object.entries(stats).map(([name, data]) => ({ name, ...data })),
            recommendations
          }
        });
      }
    );

    // Tool 7: Get Interleaving Patterns
    server.tool(
      'get_interleaving_patterns',
      'Learn about interleaving patterns and their research-backed benefits.',
      {},
      async () => {
        return createResponse({
          success: true,
          patterns: Object.entries(INTERLEAVING_PATTERNS).map(([id, info]) => ({ id, ...info })),
          researchHighlights: [
            '📈 43% better retention vs blocked practice (Rohrer & Taylor, 2007)',
            '🧠 Enhances discrimination between similar concepts',
            '🔄 Improves transfer to new problem types',
            '💪 Difficulty during learning = stronger memories'
          ],
          gettingStarted: [
            '1. Start with ABAB pattern for 2 subjects',
            '2. Use 15-25 min blocks (optimal focus duration)',
            '3. Take 2-min breaks between switches',
            '4. Progress to Random pattern as you advance'
          ]
        });
      }
    );
  },
  { capabilities: { tools: {} } },
  { basePath: '/api', maxDuration: 60, verboseLogs: process.env.NODE_ENV === 'development' }
);

export { handler as GET, handler as POST, handler as DELETE };
