import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  // 1. Check localStorage first (User-provided key)
  const savedKey = typeof window !== 'undefined' ? localStorage.getItem('WANDERLUST_API_KEY') : null;
  
  // 2. Check environment variable (Developer-provided key)
  const envKey = process.env.GEMINI_API_KEY;
  
  const finalKey = savedKey || envKey;

  if (!finalKey || finalKey === "undefined" || finalKey === "") {
    throw new Error("MISSING_API_KEY");
  }
  
  return new GoogleGenAI({ apiKey: finalKey });
};

export async function getTravelItinerary(destination: string, duration: string, interests: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Plan a ${duration} trip to ${destination} focusing on ${interests}. Provide a detailed day-by-day itinerary.`,
      config: {
        systemInstruction: "You are a world-class travel concierge. Provide refined, high-end travel recommendations in Markdown format.",
      },
    });

    if (!response.text) {
      throw new Error("EMPTY_RESPONSE");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    if (error.message === "MISSING_API_KEY") throw error;
    throw new Error("API_ERROR");
  }
}

export async function getDestinationSuggestions(query: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 unique travel destinations based on this preference: ${query}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              country: { type: Type.STRING },
              description: { type: Type.STRING },
              imageQuery: { type: Type.STRING },
            },
            required: ["name", "country", "description", "imageQuery"],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Error in getDestinationSuggestions:", error);
    return [];
  }
}
