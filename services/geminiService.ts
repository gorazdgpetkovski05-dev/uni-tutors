
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
    if (import.meta.env.DEV) {
      console.error("Gemini API Error:", error instanceof Error ? error.message : 'Unknown error');
    }
    return "Sorry, I'm having trouble connecting to the knowledge base right now.";
  }
};

// Rate limit: 1 request per 4 seconds to stay well within free tier (15 req/min)
let lastRecommendationCall = 0;

// Smart fallback: recommend courses based on category similarity when no API key
const getSmartRecommendations = (enrolledTitles: string[], allCourses: Course[]): Course[] => {
  if (allCourses.length === 0) return [];

  // If no enrollments, return top-rated courses
  if (enrolledTitles.length === 0) {
    return allCourses
      .filter(c => !c.hidden)
      .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
      .slice(0, 3);
  }

  // Find courses the student is NOT enrolled in
  const notEnrolled = allCourses.filter(c => !c.hidden && !enrolledTitles.includes(c.title));
  if (notEnrolled.length === 0) return [];

  // Score by keyword overlap with enrolled course titles
  const enrolledWords = new Set(
    enrolledTitles.flatMap(t => t.toLowerCase().split(/\s+/).filter(w => w.length > 2))
  );

  const scored = notEnrolled.map(course => {
    const words = course.title.toLowerCase().split(/\s+/);
    const overlap = words.filter(w => enrolledWords.has(w)).length;
    const ratingBonus = (course.averageRating ?? 0) / 5;
    return { course, score: overlap + ratingBonus };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.course);
};

export const getRecommendations = async (
  enrolledTitles: string[],
  allCourses: Course[]
): Promise<Course[]> => {
  if (allCourses.length === 0) return [];

  const apiKey = getApiKey();

  // No API key — use smart local recommendations
  if (!apiKey) {
    return getSmartRecommendations(enrolledTitles, allCourses);
  }

  // Client-side rate limiting
  const now = Date.now();
  if (now - lastRecommendationCall < 4000) return getSmartRecommendations(enrolledTitles, allCourses);
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
    if (import.meta.env.DEV) {
      console.error('Gemini recommendations error:', error instanceof Error ? error.message : 'Unknown error');
    }
    // Fallback to smart local recommendations on API failure
    return getSmartRecommendations(enrolledTitles, allCourses);
  }
};
