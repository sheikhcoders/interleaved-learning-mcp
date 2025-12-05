import { z } from 'zod';
import { createMcpHandler } from 'mcp-handler';

// In-memory storage (for demo - use database in production)
const studyLogs: Array<{
  userId: string;
  subject: string;
  duration: number;
  date: string;
  quizScore?: number;
}> = [];

const flashcardDecks: Map<string, {
  name: string;
  cards: Array<{ front: string; back: string; topic: string }>;
}> = new Map();

// Interleaving patterns
const interleavingPatterns = {
  'ABAB': { name: 'Simple Alternation', description: 'Alternate between two subjects (A→B→A→B)', difficulty: 'beginner' },
  'ABCABC': { name: 'Triple Rotation', description: 'Rotate through three subjects (A→B→C→A→B→C)', difficulty: 'intermediate' },
  'ABACBC': { name: 'Spaced Mixing', description: 'Mix with spacing for better retention', difficulty: 'intermediate' },
  'Random': { name: 'Random Shuffle', description: 'Randomly shuffle all topics for maximum interleaving', difficulty: 'advanced' },
  'Blocked-to-Interleaved': { name: 'Gradual Transition', description: 'Start blocked, gradually increase interleaving', difficulty: 'beginner' }
};

const handler = createMcpHandler(
  (server) => {
    // Tool 1: Create Study Plan
    server.tool(
      'create_study_plan',
      'Generate an interleaved study schedule for multiple subjects. Returns a structured plan that alternates between topics for better retention.',
      {
        subjects: z.array(z.string()).min(2).describe('List of subjects to study (minimum 2)'),
        totalMinutes: z.number().min(30).describe('Total study time in minutes'),
        pattern: z.enum(['ABAB', 'ABCABC', 'ABACBC', 'Random', 'Blocked-to-Interleaved']).optional().describe('Interleaving pattern to use')
      },
      async ({ subjects, totalMinutes, pattern = 'ABAB' }) => {
        const blocks: Array<{ subject: string; duration: number; order: number }> = [];
        const blockDuration = Math.floor(totalMinutes / (subjects.length * 2));
        
        let schedule: string[] = [];
        
        switch (pattern) {
          case 'ABAB':
            for (let i = 0; i < 4; i++) {
              schedule.push(subjects[i % subjects.length]);
            }
            break;
          case 'ABCABC':
            for (let i = 0; i < 6; i++) {
              schedule.push(subjects[i % subjects.length]);
            }
            break;
          case 'ABACBC':
            schedule = [subjects[0], subjects[1], subjects[0], subjects[2] || subjects[1], subjects[1], subjects[2] || subjects[0]];
            break;
          case 'Random':
            schedule = [...subjects, ...subjects].sort(() => Math.random() - 0.5);
            break;
          case 'Blocked-to-Interleaved':
            schedule = [...subjects, ...subjects.sort(() => Math.random() - 0.5)];
            break;
        }
        
        schedule.forEach((subject, index) => {
          blocks.push({ subject, duration: blockDuration, order: index + 1 });
        });

        const patternInfo = interleavingPatterns[pattern];
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              plan: {
                pattern: patternInfo.name,
                description: patternInfo.description,
                totalMinutes,
                blocks,
                tip: 'Take a 2-minute break between blocks. Review previous topic briefly before switching.'
              }
            }, null, 2)
          }]
        };
      }
    );

    // Tool 2: Generate Interleaved Quiz
    server.tool(
      'generate_interleaved_quiz',
      'Create a quiz with questions from multiple topics mixed together for interleaved practice.',
      {
        topics: z.array(z.object({
          name: z.string(),
          questions: z.array(z.object({
            question: z.string(),
            options: z.array(z.string()),
            correctIndex: z.number()
          }))
        })).describe('Array of topics with their questions'),
        questionsPerTopic: z.number().min(1).max(10).optional().describe('Number of questions per topic')
      },
      async ({ topics, questionsPerTopic = 3 }) => {
        const allQuestions: Array<{
          topic: string;
          question: string;
          options: string[];
          correctIndex: number;
        }> = [];

        topics.forEach(topic => {
          const selected = topic.questions.slice(0, questionsPerTopic);
          selected.forEach(q => {
            allQuestions.push({
              topic: topic.name,
              ...q
            });
          });
        });

        // Shuffle for interleaving
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              quiz: {
                totalQuestions: shuffled.length,
                questions: shuffled.map((q, i) => ({
                  number: i + 1,
                  topic: q.topic,
                  question: q.question,
                  options: q.options,
                  correctIndex: q.correctIndex
                })),
                instructions: 'Questions are interleaved from different topics. This challenges your brain to identify which concept applies to each question.'
              }
            }, null, 2)
          }]
        };
      }
    );

    // Tool 3: Create Flashcard Deck
    server.tool(
      'create_flashcard_deck',
      'Create a new flashcard deck with cards from multiple topics for interleaved review.',
      {
        deckName: z.string().describe('Name for the flashcard deck'),
        cards: z.array(z.object({
          front: z.string(),
          back: z.string(),
          topic: z.string()
        })).describe('Array of flashcards with front, back, and topic')
      },
      async ({ deckName, cards }) => {
        flashcardDecks.set(deckName, { name: deckName, cards });
        
        const topicCounts: Record<string, number> = {};
        cards.forEach(card => {
          topicCounts[card.topic] = (topicCounts[card.topic] || 0) + 1;
        });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              deck: {
                name: deckName,
                totalCards: cards.length,
                topicBreakdown: topicCounts,
                message: `Created deck "${deckName}" with ${cards.length} cards from ${Object.keys(topicCounts).length} topics.`
              }
            }, null, 2)
          }]
        };
      }
    );

    // Tool 4: Get Shuffled Flashcards
    server.tool(
      'get_shuffled_flashcards',
      'Retrieve flashcards from a deck in interleaved (shuffled) order for study.',
      {
        deckName: z.string().describe('Name of the flashcard deck'),
        count: z.number().optional().describe('Number of cards to retrieve (default: all)')
      },
      async ({ deckName, count }) => {
        const deck = flashcardDecks.get(deckName);
        
        if (!deck) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: `Deck "${deckName}" not found. Available decks: ${Array.from(flashcardDecks.keys()).join(', ') || 'none'}`
              }, null, 2)
            }]
          };
        }

        let cards = [...deck.cards].sort(() => Math.random() - 0.5);
        if (count && count < cards.length) {
          cards = cards.slice(0, count);
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              deckName,
              cards: cards.map((card, i) => ({
                number: i + 1,
                topic: card.topic,
                front: card.front,
                back: card.back
              })),
              studyTip: 'Cards are shuffled across topics. Try to recall the answer before flipping!'
            }, null, 2)
          }]
        };
      }
    );

    // Tool 5: Log Study Session
    server.tool(
      'log_study_session',
      'Record a completed study session to track learning progress over time.',
      {
        userId: z.string().describe('User identifier'),
        subject: z.string().describe('Subject studied'),
        duration: z.number().min(1).describe('Duration in minutes'),
        quizScore: z.number().min(0).max(100).optional().describe('Quiz score percentage if applicable')
      },
      async ({ userId, subject, duration, quizScore }) => {
        const session = {
          userId,
          subject,
          duration,
          date: new Date().toISOString(),
          quizScore
        };
        
        studyLogs.push(session);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              logged: session,
              message: `Logged ${duration} minutes of ${subject} study${quizScore !== undefined ? ` with ${quizScore}% quiz score` : ''}.`
            }, null, 2)
          }]
        };
      }
    );

    // Tool 6: Get Learning Progress
    server.tool(
      'get_learning_progress',
      'Retrieve learning progress and statistics for a user, with recommendations for improvement.',
      {
        userId: z.string().describe('User identifier')
      },
      async ({ userId }) => {
        const userLogs = studyLogs.filter(log => log.userId === userId);
        
        if (userLogs.length === 0) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                success: true,
                progress: null,
                message: 'No study sessions found. Start studying to track your progress!'
              }, null, 2)
            }]
          };
        }

        const subjectStats: Record<string, { totalMinutes: number; sessions: number; avgScore?: number }> = {};
        
        userLogs.forEach(log => {
          if (!subjectStats[log.subject]) {
            subjectStats[log.subject] = { totalMinutes: 0, sessions: 0 };
          }
          subjectStats[log.subject].totalMinutes += log.duration;
          subjectStats[log.subject].sessions += 1;
          if (log.quizScore !== undefined) {
            const scores = userLogs.filter(l => l.subject === log.subject && l.quizScore !== undefined);
            subjectStats[log.subject].avgScore = scores.reduce((sum, l) => sum + (l.quizScore || 0), 0) / scores.length;
          }
        });

        const totalMinutes = userLogs.reduce((sum, log) => sum + log.duration, 0);
        const subjects = Object.keys(subjectStats);
        const weakestSubject = subjects.reduce((a, b) => 
          (subjectStats[a].avgScore || 100) < (subjectStats[b].avgScore || 100) ? a : b
        );

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              progress: {
                totalSessions: userLogs.length,
                totalMinutes,
                subjectBreakdown: subjectStats,
                recommendations: [
                  subjects.length < 3 ? 'Add more subjects to benefit from interleaving' : 'Good variety of subjects!',
                  weakestSubject ? `Focus more on ${weakestSubject} - it has your lowest scores` : 'Keep up the balanced practice!',
                  totalMinutes < 60 ? 'Try to study at least 1 hour total per week' : 'Great study consistency!'
                ]
              }
            }, null, 2)
          }]
        };
      }
    );

    // Tool 7: Get Interleaving Patterns
    server.tool(
      'get_interleaving_patterns',
      'Get information about available interleaving patterns and their benefits.',
      {},
      async () => {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              patterns: Object.entries(interleavingPatterns).map(([key, value]) => ({
                id: key,
                ...value
              })),
              benefits: [
                'Improves long-term retention by up to 43%',
                'Enhances ability to distinguish between concepts',
                'Builds flexible problem-solving skills',
                'Better prepares for real-world application of knowledge'
              ],
              tips: [
                'Start with simpler patterns (ABAB) if new to interleaving',
                'Gradually increase complexity as you get comfortable',
                'Interleave related but distinct topics for best results',
                'Combine with spaced repetition for maximum retention'
              ]
            }, null, 2)
          }]
        };
      }
    );
  },
  {
    capabilities: {
      tools: {}
    }
  },
  {
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: process.env.NODE_ENV === 'development'
  }
);

export { handler as GET, handler as POST, handler as DELETE };
