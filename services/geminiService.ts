import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatWithGemini = async (message: string, history: string[] = []) => {
  if (!process.env.API_KEY) {
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