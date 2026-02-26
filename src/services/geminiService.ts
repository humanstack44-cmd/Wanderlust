import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getTravelItinerary(destination: string, duration: string, interests: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Plan a ${duration} trip to ${destination} focusing on ${interests}. Provide a detailed day-by-day itinerary.`,
    config: {
      systemInstruction: "You are a world-class travel concierge. Provide refined, high-end travel recommendations in Markdown format.",
    },
  });

  return response.text;
}

export async function getDestinationSuggestions(query: string) {
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

  return JSON.parse(response.text || "[]");
}
