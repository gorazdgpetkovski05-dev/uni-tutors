
import { GoogleGenAI } from "@google/genai";

// Helper to safely access environment variables without crashing in browser environments
const getApiKey = () => {
  try {
    // Check if process is defined (Node.js or polyfilled)
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY;
    }
    // Check for Vite's import.meta.env
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;
    }
  } catch (e) {
    // Ignore errors
  }
  return undefined;
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey: apiKey || '123' }); // Pass dummy key if missing to prevent init crash

export const chatWithGemini = async (message: string, history: string[] = []) => {
  // Check if we have a valid key before calling API
  if (!apiKey || apiKey === '123') {
    // Fallback for demo purposes if no API key is present
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve("I'm the UniTutors AI! It seems my API key is missing, but I'm here to help you study subjects from Economics to Computer Science once fully configured.");
      }, 1000);
    });
  }

  try {
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
