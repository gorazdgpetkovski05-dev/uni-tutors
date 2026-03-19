
import { GoogleGenAI } from "@google/genai";

// Helper to safely access environment variables without crashing in browser environments
const getApiKey = () => {
  try {
    // Always use process.env.GEMINI_API_KEY for the Gemini API as per guidelines
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
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-3-flash-preview';
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
