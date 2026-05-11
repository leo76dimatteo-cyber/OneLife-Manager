import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../db/db";
import enPayload from "../locales/en.json";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getTranslation(lng: string): Promise<any> {
  // 1. Check local cache
  const cached = await db.translations.get(lng.split('-')[0]);
  if (cached && Date.now() - cached.updatedAt < 1000 * 60 * 60 * 24 * 7) { // 1 week cache
    return cached.data;
  }

  // 2. We don't translate English or Italian as they are already provided locally
  if (lng.startsWith('en') || lng.startsWith('it')) {
    return null; // i18next will use the local files
  }

  // 3. Translate using Gemini
  try {
    const formattedLng = lng.split('-')[0];
    const prompt = `Translate the following JSON object from English to ${formattedLng}. 
    Keep the exact same keys and structure. 
    Only translate the values. 
    The output must be a valid JSON object.
    
    JSON: ${JSON.stringify(enPayload)}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const translatedData = JSON.parse(response.text);

    // 4. Save to cache
    await db.translations.put({
      lng: formattedLng,
      data: translatedData,
      updatedAt: Date.now()
    });

    return translatedData;
  } catch (err) {
    console.error("Translation error:", err);
    return null;
  }
}
