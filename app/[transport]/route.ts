import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";

// ============================================
// INTERLEAVED LEARNING MCP SERVER
// ============================================
// Features:
// 1. Study Scheduler - Generate interleaved study plans
// 2. Quiz Generator - Create mixed-topic quizzes
// 3. Flashcard Shuffler - Shuffle flashcards across topics
// 4. Learning Tracker - Track progress with recommendations
// ============================================

// In-memory storage (for demo - use database in production)
const learningData: Map<string, {
  subjects: Map<string, {
    name: string;
    topics: string[];
    flashcards: { front: string; back: string; topic: string }[];
    quizHistory: { date: string; score: number; topic: string }[];
    studySessions: { date: string; duration: number; topics: string[] }[];
  }>;
}> = new Map();

// Interleaving patterns
const INTERLEAVING_PATTERNS = {
  random: "Random cycling - unpredictable order for maximum discrimination",
  systematic_short: "ABCABC - Quick rotations between topics",
  systematic_extended: "AABBCC - Longer focus periods with interleaving",
  front_loaded: "AAABBBCCC then ABC - Deep study followed by rapid review",
  spaced: "Spaced repetition integrated with interleaving"
};

// Utility functions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateInterleavedSequence(
  topics: string[],
  pattern: string,
  totalItems: number
): string[] {
  const sequence: string[] = [];

  switch (pattern) {
    case "random":
      for (let i = 0; i < totalItems; i++) {
        sequence.push(topics[Math.floor(Math.random() * topics.length)]);
      }
      break;

    case "systematic_short":
      for (let i = 0; i < totalItems; i++) {
        sequence.push(topics[i % topics.length]);
      }
      break;

    case "systematic_extended":
      const blockSize = 2;
      for (let round = 0; round < Math.ceil(totalItems / (topics.length * blockSize)); round++) {
        for (const topic of topics) {
          for (let i = 0; i < blockSize && sequence.length < totalItems; i++) {
            sequence.push(topic);
          }
        }
      }
      break;

    case "front_loaded":
      const deepStudySize = 3;
      for (const topic of topics) {
        for (let i = 0; i < deepStudySize && sequence.length < totalItems * 0.7; i++) {
          sequence.push(topic);
        }
      }
      while (sequence.length < totalItems) {
        for (const topic of topics) {
          if (sequence.length < totalItems) {
            sequence.push(topic);
          }
        }
      }
      break;

    case "spaced":
      const weighted = topics.flatMap((t, idx) =>
        Array(topics.length - idx).fill(t)
      );
      for (let i = 0; i < totalItems; i++) {
        sequence.push(weighted[Math.floor(Math.random() * weighted.length)]);
      }
      break;

    default:
      for (let i = 0; i < totalItems; i++) {
        sequence.push(topics[i % topics.length]);
      }
  }

  return sequence;
}

// Create the MCP handler
const handler = createMcpHandler({
  name: "interleaved-learning-mcp",
  version: "1.0.0",
  capabilities: {
    tools: {}
  },
  tools: {
    // TOOL 1: STUDY SCHEDULER
    create_study_plan: {
      description: `Generate an interleaved study plan that mixes multiple subjects/topics for optimal learning.

Interleaving helps the brain learn to differentiate between concepts, strengthening memory and improving transfer of knowledge.

Available patterns:
- random: Unpredictable order for maximum discrimination learning
- systematic_short: ABCABC - Quick rotations between topics
- systematic_extended: AABBCC - Longer focus with interleaving
- front_loaded: Deep study (AAA BBB CCC) then rapid review (ABC)
- spaced: Spaced repetition integrated with interleaving`,
      parameters: z.object({
        user_id: z.string().describe("Unique identifier for the user"),
        subjects: z.array(z.object({
          name: z.string().describe("Subject name (e.g., 'Mathematics', 'Physics')"),
          topics: z.array(z.string()).describe("List of topics within the subject")
        })).describe("List of subjects with their topics"),
        duration_minutes: z.number().min(15).max(480).describe("Total study session duration in minutes"),
        pattern: z.enum(["random", "systematic_short", "systematic_extended", "front_loaded", "spaced"])
          .default("systematic_short")
          .describe("Interleaving pattern to use"),
        breaks_enabled: z.boolean().default(true).describe("Include break recommendations")
      }),
      execute: async ({ user_id, subjects, duration_minutes, pattern, breaks_enabled }) => {
        if (!learningData.has(user_id)) {
          learningData.set(user_id, { subjects: new Map() });
        }

        const userData = learningData.get(user_id)!;

        for (const subject of subjects) {
          userData.subjects.set(subject.name, {
            name: subject.name,
            topics: subject.topics,
            flashcards: [],
            quizHistory: [],
            studySessions: []
          });
        }

        const allTopics = subjects.flatMap(s =>
          s.topics.map(t => `${s.name}: ${t}`)
        );

        const totalBlocks = Math.floor(duration_minutes / 10);
        const sequence = generateInterleavedSequence(allTopics, pattern, totalBlocks);

        const schedule: { time: string; topic: string; activity: string }[] = [];
        let currentMinute = 0;

        for (let i = 0; i < sequence.length; i++) {
          const hours = Math.floor(currentMinute / 60);
          const mins = currentMinute % 60;
          const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

          schedule.push({
            time: timeStr,
            topic: sequence[i],
            activity: i % 3 === 0 ? "Learn new concepts" :
                     i % 3 === 1 ? "Practice problems" : "Review & self-test"
          });

          currentMinute += 10;

          if (breaks_enabled && (i + 1) % 4 === 0 && i < sequence.length - 1) {
            const breakHours = Math.floor(currentMinute / 60);
            const breakMins = currentMinute % 60;
            schedule.push({
              time: `${breakHours.toString().padStart(2, '0')}:${breakMins.toString().padStart(2, '0')}`,
              topic: "BREAK",
              activity: "5-minute rest - stretch, hydrate, relax"
            });
            currentMinute += 5;
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                study_plan: {
                  user_id,
                  pattern,
                  pattern_description: INTERLEAVING_PATTERNS[pattern],
                  total_duration: `${duration_minutes} minutes`,
                  subjects_count: subjects.length,
                  topics_count: allTopics.length,
                  blocks_count: sequence.length,
                  schedule,
                  tips: [
                    "Interleaving may feel harder initially - this 'desirable difficulty' improves long-term retention",
                    "Switching between topics forces your brain to practice retrieval",
                    "Track your progress to see improvement over time",
                    "If a topic feels too easy, try mixing in more challenging variants"
                  ]
                }
              }, null, 2)
            }
          ]
        };
      }
    },

    // TOOL 2: QUIZ GENERATOR
    generate_interleaved_quiz: {
      description: `Create an interleaved quiz that mixes questions from multiple topics.

This helps learners practice discrimination - identifying which strategy or concept applies to each problem.`,
      parameters: z.object({
        topics: z.array(z.object({
          name: z.string().describe("Topic name"),
          questions: z.array(z.object({
            question: z.string().describe("The question text"),
            options: z.array(z.string()).optional().describe("Multiple choice options (if applicable)"),
            answer: z.string().describe("Correct answer"),
            difficulty: z.enum(["easy", "medium", "hard"]).default("medium")
          })).describe("Questions for this topic")
        })).describe("Topics with their questions"),
        quiz_length: z.number().min(5).max(50).default(10).describe("Number of questions in the quiz"),
        shuffle_options: z.boolean().default(true).describe("Shuffle multiple choice options"),
        include_topic_hints: z.boolean().default(false).describe("Show which topic each question is from")
      }),
      execute: async ({ topics, quiz_length, shuffle_options, include_topic_hints }) => {
        const allQuestions = topics.flatMap(topic =>
          topic.questions.map(q => ({
            ...q,
            topic: topic.name
          }))
        );

        const shuffled = shuffleArray(allQuestions);
        const selectedQuestions = shuffled.slice(0, Math.min(quiz_length, shuffled.length));

        const quiz = selectedQuestions.map((q, idx) => {
          const formattedQ: any = {
            number: idx + 1,
            question: q.question,
            difficulty: q.difficulty
          };

          if (include_topic_hints) {
            formattedQ.topic_hint = q.topic;
          }

          if (q.options && q.options.length > 0) {
            formattedQ.options = shuffle_options ? shuffleArray(q.options) : q.options;
            formattedQ.type = "multiple_choice";
          } else {
            formattedQ.type = "open_ended";
          }

          return formattedQ;
        });

        const answerKey = selectedQuestions.map((q, idx) => ({
          number: idx + 1,
          topic: q.topic,
          correct_answer: q.answer
        }));

        const topicDistribution: Record<string, number> = {};
        selectedQuestions.forEach(q => {
          topicDistribution[q.topic] = (topicDistribution[q.topic] || 0) + 1;
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                quiz: {
                  title: "Interleaved Practice Quiz",
                  description: "Questions are mixed from multiple topics to enhance discrimination learning",
                  total_questions: quiz.length,
                  topic_distribution: topicDistribution,
                  questions: quiz,
                  interleaving_benefit: "By mixing question types, you practice identifying WHICH strategy to use, not just HOW to use it"
                },
                answer_key: answerKey
              }, null, 2)
            }
          ]
        };
      }
    },

    // TOOL 3: FLASHCARD SHUFFLER
    create_flashcard_deck: {
      description: `Create and manage interleaved flashcard decks across multiple topics.

Flashcards are shuffled across topics to maximize the interleaving effect.`,
      parameters: z.object({
        user_id: z.string().describe("Unique identifier for the user"),
        deck_name: z.string().describe("Name for this flashcard deck"),
        cards: z.array(z.object({
          front: z.string().describe("Front of the card (question/prompt)"),
          back: z.string().describe("Back of the card (answer)"),
          topic: z.string().describe("Topic this card belongs to"),
          tags: z.array(z.string()).optional().describe("Optional tags for filtering")
        })).describe("Flashcards to add")
      }),
      execute: async ({ user_id, deck_name, cards }) => {
        if (!learningData.has(user_id)) {
          learningData.set(user_id, { subjects: new Map() });
        }

        const userData = learningData.get(user_id)!;

        for (const card of cards) {
          if (!userData.subjects.has(card.topic)) {
            userData.subjects.set(card.topic, {
              name: card.topic,
              topics: [],
              flashcards: [],
              quizHistory: [],
              studySessions: []
            });
          }
          userData.subjects.get(card.topic)!.flashcards.push({
            front: card.front,
            back: card.back,
            topic: card.topic
          });
        }

        const topicStats: Record<string, number> = {};
        cards.forEach(c => {
          topicStats[c.topic] = (topicStats[c.topic] || 0) + 1;
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                deck: {
                  name: deck_name,
                  user_id,
                  total_cards: cards.length,
                  topics: Object.keys(topicStats),
                  cards_per_topic: topicStats,
                  message: `Created deck "${deck_name}" with ${cards.length} cards across ${Object.keys(topicStats).length} topics`
                }
              }, null, 2)
            }
          ]
        };
      }
    },

    get_shuffled_flashcards: {
      description: `Get a shuffled, interleaved set of flashcards for study.

Cards are shuffled across topics to create an interleaved practice session.`,
      parameters: z.object({
        user_id: z.string().describe("Unique identifier for the user"),
        topics: z.array(z.string()).optional().describe("Specific topics to include (all if not specified)"),
        count: z.number().min(1).max(100).default(20).describe("Number of cards to retrieve"),
        pattern: z.enum(["random", "systematic", "balanced"]).default("random")
          .describe("How to interleave cards from different topics")
      }),
      execute: async ({ user_id, topics, count, pattern }) => {
        const userData = learningData.get(user_id);

        if (!userData) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  success: false,
                  error: "No flashcards found for this user. Create a deck first."
                }, null, 2)
              }
            ]
          };
        }

        let allCards: { front: string; back: string; topic: string }[] = [];

        for (const [topicName, subjectData] of userData.subjects) {
          if (!topics || topics.length === 0 || topics.includes(topicName)) {
            allCards = allCards.concat(subjectData.flashcards);
          }
        }

        if (allCards.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  success: false,
                  error: "No flashcards found for the specified topics."
                }, null, 2)
              }
            ]
          };
        }

        let selectedCards: typeof allCards;

        switch (pattern) {
          case "balanced":
            const topicGroups = new Map<string, typeof allCards>();
            allCards.forEach(c => {
              if (!topicGroups.has(c.topic)) {
                topicGroups.set(c.topic, []);
              }
              topicGroups.get(c.topic)!.push(c);
            });

            selectedCards = [];
            const topicsArray = Array.from(topicGroups.keys());
            let idx = 0;
            while (selectedCards.length < count) {
              const topic = topicsArray[idx % topicsArray.length];
              const topicCards = topicGroups.get(topic)!;
              if (topicCards.length > 0) {
                const randomIdx = Math.floor(Math.random() * topicCards.length);
                selectedCards.push(topicCards.splice(randomIdx, 1)[0]);
              }
              idx++;
              if (Array.from(topicGroups.values()).every(g => g.length === 0)) {
                break;
              }
            }
            break;

          case "systematic":
            const sortedByTopic = [...allCards].sort((a, b) => a.topic.localeCompare(b.topic));
            selectedCards = sortedByTopic.slice(0, count);
            break;

          default:
            selectedCards = shuffleArray(allCards).slice(0, count);
        }

        const cardsWithIndex = selectedCards.map((card, idx) => ({
          card_number: idx + 1,
          ...card
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                session: {
                  total_cards: cardsWithIndex.length,
                  pattern_used: pattern,
                  interleaving_tip: "Try to identify the topic before flipping each card - this strengthens discrimination learning",
                  cards: cardsWithIndex
                }
              }, null, 2)
            }
          ]
        };
      }
    },

    // TOOL 4: LEARNING TRACKER
    log_study_session: {
      description: `Log a completed study session to track learning progress.`,
      parameters: z.object({
        user_id: z.string().describe("Unique identifier for the user"),
        topics_studied: z.array(z.string()).describe("Topics covered in this session"),
        duration_minutes: z.number().min(1).describe("Duration of study in minutes"),
        quiz_score: z.number().min(0).max(100).optional().describe("Quiz score if a quiz was taken"),
        notes: z.string().optional().describe("Optional notes about the session")
      }),
      execute: async ({ user_id, topics_studied, duration_minutes, quiz_score, notes }) => {
        if (!learningData.has(user_id)) {
          learningData.set(user_id, { subjects: new Map() });
        }

        const userData = learningData.get(user_id)!;
        const sessionDate = new Date().toISOString();

        for (const topic of topics_studied) {
          if (!userData.subjects.has(topic)) {
            userData.subjects.set(topic, {
              name: topic,
              topics: [topic],
              flashcards: [],
              quizHistory: [],
              studySessions: []
            });
          }

          const subjectData = userData.subjects.get(topic)!;
          subjectData.studySessions.push({
            date: sessionDate,
            duration: duration_minutes / topics_studied.length,
            topics: [topic]
          });

          if (quiz_score !== undefined) {
            subjectData.quizHistory.push({
              date: sessionDate,
              score: quiz_score,
              topic
            });
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                session_logged: {
                  date: sessionDate,
                  topics: topics_studied,
                  duration: `${duration_minutes} minutes`,
                  quiz_score: quiz_score !== undefined ? `${quiz_score}%` : "N/A",
                  notes: notes || "None",
                  message: "Study session logged successfully!"
                }
              }, null, 2)
            }
          ]
        };
      }
    },

    get_learning_progress: {
      description: `Get learning progress and recommendations based on study history.`,
      parameters: z.object({
        user_id: z.string().describe("Unique identifier for the user"),
        include_recommendations: z.boolean().default(true).describe("Include personalized recommendations")
      }),
      execute: async ({ user_id, include_recommendations }) => {
        const userData = learningData.get(user_id);

        if (!userData || userData.subjects.size === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify({
                  success: false,
                  error: "No learning data found for this user. Start by creating a study plan or logging sessions."
                }, null, 2)
              }
            ]
          };
        }

        const topicProgress: Record<string, {
          total_study_time: number;
          session_count: number;
          average_quiz_score: number | null;
          flashcard_count: number;
          last_studied: string | null;
        }> = {};

        for (const [topicName, subjectData] of userData.subjects) {
          const sessions = subjectData.studySessions;
          const quizzes = subjectData.quizHistory;

          const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
          const avgScore = quizzes.length > 0
            ? quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length
            : null;
          const lastSession = sessions.length > 0
            ? sessions[sessions.length - 1].date
            : null;

          topicProgress[topicName] = {
            total_study_time: Math.round(totalTime),
            session_count: sessions.length,
            average_quiz_score: avgScore ? Math.round(avgScore) : null,
            flashcard_count: subjectData.flashcards.length,
            last_studied: lastSession
          };
        }

        const recommendations: string[] = [];

        if (include_recommendations) {
          const topics = Object.entries(topicProgress);

          const leastStudied = topics.sort((a, b) => a[1].total_study_time - b[1].total_study_time);
          if (leastStudied.length > 0 && leastStudied[0][1].total_study_time < 60) {
            recommendations.push(`"${leastStudied[0][0]}" needs more study time - only ${leastStudied[0][1].total_study_time} minutes logged`);
          }

          const lowScores = topics.filter(([_, p]) => p.average_quiz_score !== null && p.average_quiz_score < 70);
          lowScores.forEach(([name, progress]) => {
            recommendations.push(`Review "${name}" - average quiz score is ${progress.average_quiz_score}%`);
          });

          if (topics.length >= 2) {
            recommendations.push("Continue interleaving topics - mixing subjects strengthens discrimination learning");
          }

          if (topics.some(([_, p]) => p.flashcard_count === 0)) {
            recommendations.push("Create flashcards for topics that don't have any yet");
          }

          const daysSinceStudy = topics.map(([name, p]) => {
            if (!p.last_studied) return { name, days: Infinity };
            const days = (Date.now() - new Date(p.last_studied).getTime()) / (1000 * 60 * 60 * 24);
            return { name, days };
          });

          const needsReview = daysSinceStudy.filter(t => t.days > 3 && t.days !== Infinity);
          needsReview.forEach(t => {
            recommendations.push(`"${t.name}" hasn't been studied in ${Math.round(t.days)} days - time for spaced review!`);
          });
        }

        const totalStudyTime = Object.values(topicProgress).reduce((sum, p) => sum + p.total_study_time, 0);
        const totalSessions = Object.values(topicProgress).reduce((sum, p) => sum + p.session_count, 0);
        const allScores = Object.values(topicProgress)
          .filter(p => p.average_quiz_score !== null)
          .map(p => p.average_quiz_score!);
        const overallAvgScore = allScores.length > 0
          ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
          : null;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                progress: {
                  user_id,
                  overall: {
                    total_study_time: `${totalStudyTime} minutes`,
                    total_sessions: totalSessions,
                    topics_count: Object.keys(topicProgress).length,
                    overall_average_score: overallAvgScore ? `${overallAvgScore}%` : "No quizzes taken yet"
                  },
                  by_topic: topicProgress,
                  recommendations: include_recommendations ? recommendations : undefined
                }
              }, null, 2)
            }
          ]
        };
      }
    },

    get_interleaving_patterns: {
      description: `Get information about available interleaving patterns and when to use them.`,
      parameters: z.object({}),
      execute: async () => {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                success: true,
                patterns: {
                  random: {
                    name: "Random Cycling",
                    example: "A-C-B-A-A-B-A-C",
                    description: "Unpredictable order for maximum discrimination learning",
                    best_for: "Advanced learners, building flexible retrieval, exam preparation",
                    difficulty: "High (most challenging)"
                  },
                  systematic_short: {
                    name: "Systematic Short",
                    example: "A-B-C-A-B-C-A-B-C",
                    description: "Quick rotations between topics",
                    best_for: "Beginners to interleaving, maintaining engagement, multiple new topics",
                    difficulty: "Medium"
                  },
                  systematic_extended: {
                    name: "Systematic Extended",
                    example: "A-A-B-B-C-C-A-A-B-B-C-C",
                    description: "Longer focus periods with interleaving",
                    best_for: "Complex topics requiring deeper focus, building initial understanding",
                    difficulty: "Medium-Low"
                  },
                  front_loaded: {
                    name: "Front-Loaded",
                    example: "A-A-A-B-B-B-C-C-C then A-B-C",
                    description: "Deep study followed by rapid review",
                    best_for: "New material introduction, combining blocked and interleaved benefits",
                    difficulty: "Low to Medium"
                  },
                  spaced: {
                    name: "Spaced Interleaving",
                    example: "Varies based on individual topic strength",
                    description: "Spaced repetition integrated with interleaving",
                    best_for: "Long-term retention, personalized learning",
                    difficulty: "Variable"
                  }
                },
                research_insights: [
                  "Interleaving is more effective than blocking for problem-solving and categorization",
                  "The initial difficulty of interleaving ('desirable difficulty') improves long-term retention",
                  "Interleaving helps learners identify WHICH strategy to use, not just HOW to use it",
                  "Combining interleaving with spaced repetition produces optimal results"
                ]
              }, null, 2)
            }
          ]
        };
      }
    }
  }
});

export { handler as GET, handler as POST, handler as DELETE };
