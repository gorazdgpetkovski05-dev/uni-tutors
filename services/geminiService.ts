
import type { Course } from '../types';

// Helper to safely access environment variables without crashing in browser environments
const getApiKey = () => {
  try {
    // Vite exposes env vars via import.meta.env with VITE_ prefix
    if (import.meta.env?.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY as string;
    }
    // Fallback for non-Vite environments
    if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }
  } catch (e) {
    // Ignore errors
  }
  return undefined;
};

export const chatWithGemini = async (message: string, history: string[] = []) => {
  const apiKey = getApiKey();
  
  // Check if we have a valid key before calling API
  if (!apiKey) {
    // Fallback for demo purposes if no API key is present
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve("I'm the UniTutors AI! It seems my API key is missing, but I'm here to help you study courses from Economics to Computer Science once fully configured.");
      }, 1000);
    });
  }

  try {
    // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.0-flash';
    const response = await ai.models.generateContent({
      model: model,
      contents: message,
      config: {
        systemInstruction: "You are a helpful, encouraging, and knowledgeable AI tutor for university students in Macedonia. You help students understand topics across various faculties (Computer Science, Economics, Law, Medicine). Keep answers concise, academic but accessible.",
      }
    });

    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the knowledge base right now.";
  }
};

// Rate limit: 1 request per 4 seconds to stay well within free tier (15 req/min)
let lastRecommendationCall = 0;

export const getRecommendations = async (
  enrolledTitles: string[],
  allCourses: Course[]
): Promise<Course[]> => {
  const apiKey = getApiKey();
  if (!apiKey || allCourses.length === 0) return [];

  // Client-side rate limiting
  const now = Date.now();
  if (now - lastRecommendationCall < 4000) return [];
  lastRecommendationCall = now;

  const availableTitles = allCourses.map(c => c.title).join('\n');
  const enrolledStr = enrolledTitles.length > 0
    ? `The student is currently enrolled in: ${enrolledTitles.join(', ')}.`
    : 'The student has not enrolled in any courses yet.';

  const prompt = `You are a course recommendation engine for a Macedonian university tutoring platform.
${enrolledStr}
Available courses:
${availableTitles}

Recommend exactly 3 courses from the available list above that would be most useful for this student. Reply ONLY with a JSON array of course titles, exactly as they appear in the list. Example: ["Course A", "Course B", "Course C"]`;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response.text || '';
    const match = text.match(/\[[\s\S]*?\]/);
    if (!match) return [];
    const titles: string[] = JSON.parse(match[0]);
    return titles
      .map(title => allCourses.find(c => c.title === title))
      .filter(Boolean) as Course[];
  } catch (error) {
    console.error('Gemini recommendations error:', error);
    return [];
  }
};
