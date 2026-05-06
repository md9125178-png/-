import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function suggestCategory(note: string, type: 'income' | 'expense') {
  if (!note || note.length < 3) return null;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a category for this ${type} note: "${note}". 
                 Available categories: ${type === 'income' ? 'Salary, Business, Others, Gift, Investment' : 'Food, Transport, Medical, Family, Education, Shopping, Utilities, Rent, Others'}.
                 Return only the category name.`,
      config: {
        temperature: 0.1,
      }
    });

    return response.text?.trim() || null;
  } catch (error) {
    console.error("Gemini Suggestion Error:", error);
    return null;
  }
}

export async function analyzeTransaction(note: string) {
  // Can be used for "Smart reminders" or detecting due dates
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract the requested date or reminder from this note: "${note}".
                 Return JSON with fields: hasReminder (boolean), dueDate (string YYYY-MM-DD or null), summary (string).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hasReminder: { type: Type.BOOLEAN },
            dueDate: { type: Type.STRING },
            summary: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return null;
  }
}
