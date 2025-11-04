import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

async function callGemini(
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts ?? []) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
                return part.inlineData.data;
            }
        }

        throw new Error("No image was generated in the response.");
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`API call failed: ${error.message}`);
        }
        throw new Error("An unexpected error occurred during the API call.");
    }
}

export async function editImageWithPrompt(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  if (!prompt.trim()) {
    throw new Error("Prompt cannot be empty.");
  }
  return callGemini(base64ImageData, mimeType, prompt);
}

export async function upscaleImage(
    base64ImageData: string,
    mimeType: string
): Promise<string> {
    const upscalePrompt = "Upscale this image to a higher resolution, making it sharper, clearer, and more detailed.";
    return callGemini(base64ImageData, mimeType, upscalePrompt);
}