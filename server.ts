import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Load environment variables
dotenv.config();

// Standard lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required to run the quiz generator');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTE: HEALTH CHECK ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // --- API ROUTE: GENERATE TRIVIA QUESTIONS ---
  app.post('/api/questions', async (req, res): Promise<any> => {
    try {
      const { category, difficulty, count = 5 } = req.body;

      if (!category) {
        return res.status(400).json({ error: 'Category is required' });
      }

      const activeDifficulty = difficulty || 'normal';
      const questionCount = Math.min(Math.max(Number(count) || 5, 2), 12);

      let classGuideline = "balanced, standard facts suitable for a typical trivia enthusiast.";
      if (activeDifficulty === 'easy') {
        classGuideline = "approachable, highly recognizable facts, friendly, and straightforward trivia for beginners.";
      } else if (activeDifficulty === 'hard') {
        classGuideline = "deeply analytical, rich with nuanced historical, scientific and cultural contexts for experienced competitors.";
      } else if (activeDifficulty === 'extreme') {
        classGuideline = "ultra-obscure academic masteries, extreme technicalities, or highly niche timelines for grand master specialists.";
      }

      const ai = getAiClient();
      const prompt = `You are an elite trivia generator specializing in fun, engaging, and verified questions.
Generate exactly ${questionCount} trivia questions for the category "${category}" with a difficulty level of "${activeDifficulty}".
We require ${activeDifficulty.toUpperCase()} difficulty questions: ${classGuideline}

Rules:
1. Every question must have exactly 4 diverse and plausible options.
2. Only one option must be strictly correct. Use academic/fact-based alignment.
3. The 'correctAnswerIndex' must be an integer from 0 to 3 corresponding to that option's index.
4. Keep questionText concise but informative. Include an 'explanation' paragraph explaining WHY it is correct and a short 'funFact' containing a supplementary cool trivia fact.
5. Generate fresh, non-cliché, clever questions. For example, rather than 'What is the capital of France', choose interesting elements of French history, culture, geography or science.

Return the questions strictly in a JSON array.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                questionText: { type: Type.STRING },
                category: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswerIndex: { type: Type.INTEGER },
                difficulty: { type: Type.STRING },
                explanation: { type: Type.STRING },
                funFact: { type: Type.STRING },
              },
              required: [
                'id',
                'questionText',
                'options',
                'correctAnswerIndex',
                'difficulty',
                'explanation',
              ],
            },
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response received from Gemini AI model');
      }

      const questions = JSON.parse(responseText);
      
      // Inject fallback local IDs and standard category if fields are missing
      const processedQuestions = questions.map((q: any, idx: number) => ({
        id: q.id || `q_${Date.now()}_${idx}_${Math.floor(Math.random() * 10000)}`,
        questionText: q.questionText || '',
        category: q.category || category,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
        correctAnswerIndex: typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3 ? q.correctAnswerIndex : 0,
        difficulty: q.difficulty || activeDifficulty,
        explanation: q.explanation || 'No explanation available.',
        funFact: q.funFact || undefined,
        generatedAt: new Date().toISOString(),
      }));

      return res.json({
        success: true,
        count: processedQuestions.length,
        questions: processedQuestions,
      });
    } catch (error: any) {
      console.error('Trivia generation error:', error);
      return res.status(500).json({
        error: 'Failed to generate trivia questions',
        message: error.message || String(error),
      });
    }
  });

  // Vite middleware for development or Static Assets for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for SPA router fallbacks
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Trivia Server] Live at http://localhost:${PORT} under NODE_ENV=${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
