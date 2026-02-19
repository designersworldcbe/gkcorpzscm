
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client using only the environment variable as per guidelines.
// Note: UI components using this service have been disabled as per user request to remove AI dashboard.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSupplyChainInsight(context: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a supply chain expert, analyze the following system data and provide a short, actionable insight or warning about inventory, order flow, or supplier performance: ${context}`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 100 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "AI Insights currently unavailable.";
  }
}
