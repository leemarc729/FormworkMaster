import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateClause = async (prompt: string): Promise<string> => {
  if (!ai) {
    throw new Error("API Key is missing.");
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a legal assistant specializing in construction and engineering contracts in Taiwan (Republic of China). 
    Your task is to draft specific, professional, and legally sound contract clauses based on the user's request.
    Focus on "Formwork Engineering" (模板工程).
    Output ONLY the clause text in Traditional Chinese (繁體中文). Do not include explanations.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "無法產生條款，請稍後再試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate clause.");
  }
};

export const reviewContractRisks = async (contractText: string): Promise<string> => {
     if (!ai) {
    throw new Error("API Key is missing.");
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a senior construction project manager. Review the provided contract summary for potential risks for the sub-contractor.
    Provide a bulleted list of 3-5 key risks or missing protections in Traditional Chinese. Keep it concise.`;

    const response = await ai.models.generateContent({
      model,
      contents: contractText,
      config: {
        systemInstruction,
      }
    });

    return response.text || "無法分析風險。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
