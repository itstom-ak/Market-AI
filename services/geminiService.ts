
import { GoogleGenAI } from "@google/genai";
import { AiGeneratedContent } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

// Utility to convert file to base64
const fileToGenerativePart = (file: File) => {
    return new Promise<{ mimeType: string; data: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            resolve({
                mimeType: file.type,
                data: base64Data,
            });
        };
        reader.onerror = (error) => reject(error);
    });
};


export const analyzeImageAndSuggestDetails = async (imageFile: File): Promise<AiGeneratedContent> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        
        const prompt = `Analyze the object in this image using Google Search to identify it. I am trying to find a replacement part or a similar item. Respond ONLY with a JSON object containing "title", "description", and "categories". The title should be concise. The description should be a detailed technical description for a vendor. The "categories" field should be an array of up to three most relevant choices from this list: "Auto Parts", "Plumbing", "Electronics", "Hardware", "Computing", "Home Improvement", "Appliances", "Gardening", "Sporting Goods", "Industrial", "General". Do not include any text, formatting, or code fences outside of the JSON object.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: imagePart },
                    { text: prompt }
                ]
            },
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        
        let text = response.text.trim();
        // Clean up potential markdown code fences
        if (text.startsWith('```json')) {
            text = text.slice(7, -3).trim();
        } else if (text.startsWith('```')) {
            text = text.slice(3, -3).trim();
        }

        const parsedJson = JSON.parse(text);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

        return {
            ...parsedJson,
            groundingChunks,
        } as AiGeneratedContent;

    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        throw new Error("Failed to analyze image with Google Search. Please try again.");
    }
};