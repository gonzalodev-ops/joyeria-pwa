import { supabase } from './supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini service for image analysis and lighting enhancement suggestions
// Supports both Edge Function (production) and direct API (development)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface JewelryMetadata {
    title: string;
    category: 'Anillos' | 'Collares' | 'Aretes' | 'Relojes' | 'Pulseras' | 'Otro';
    material: string;
    description: string;
    keywords: string[];
    cloudinary_enhancements: {
        brightness: number;
        contrast: number;
        saturation: number;
        auto_enhance: boolean;
    };
    lighting_analysis: string;
}

export const analyzeJewelryImage = async (imageUrl: string): Promise<JewelryMetadata> => {
    try {
        // Fetch the image and convert to base64
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });

        const imageData = base64Data.split(',')[1];
        const mimeType = blob.type;

        const prompt = `Analiza esta imagen de joyería y extrae la siguiente información en formato JSON.
IMPORTANTE: Toda la información debe estar en ESPAÑOL.

{
  "title": "Título descriptivo en español",
  "category": "Una de: Anillos, Collares, Aretes, Relojes, Pulseras, Otro",
  "material": "Materiales detectados en español (ej: Plata, Oro, Cristal)",
  "description": "Descripción breve y atractiva en español (máximo 140 caracteres)",
  "keywords": ["palabra1", "palabra2", "palabra3", "palabra4", "palabra5"],
  "cloudinary_enhancements": {
    "brightness": <número entre -100 y 100>,
    "contrast": <número entre -100 y 100>,
    "saturation": <número entre -100 y 100>,
    "auto_enhance": <true o false>
  },
  "lighting_analysis": "Análisis breve de la iluminación actual en español"
}

Enfócate en las mejores prácticas de fotografía de joyería. Sugiere mejoras que hagan que la pieza se vea premium.
Responde SOLO con el JSON, sin texto adicional.`;

        // Try Edge Function first (production mode)
        try {
            console.log('Calling Edge Function for metadata extraction...');
            const { data, error } = await supabase.functions.invoke('analyze-image', {
                body: { imageData, mimeType, prompt }
            });

            if (error) {
                console.error('Edge Function error:', error);
                throw error;
            }

            if (data?.analysis) {
                // Parse JSON from response
                const jsonMatch = data.analysis.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
        } catch (edgeFunctionError) {
            console.error('Edge Function failed:', edgeFunctionError);
            console.log('Falling back to direct API');
        }

        // Fallback to direct API call (development mode)
        if (GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const imagePart = {
                inlineData: {
                    data: imageData,
                    mimeType: mimeType,
                },
            };

            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();

            // Extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('No valid JSON found in Gemini response');
        }

        throw new Error("No Gemini API available (neither Edge Function nor API key)");
    } catch (error) {
        console.error("Error analyzing jewelry image with Gemini:", error);
        throw new Error("Failed to extract jewelry metadata");
    }
};

export const analyzeImageLighting = async (imageUrl: string): Promise<string> => {
    try {
        // Fetch the image and convert to base64
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const base64Data = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });

        // Extract base64 data without the data URL prefix
        const imageData = base64Data.split(',')[1];
        const mimeType = blob.type;

        // Try Edge Function first (production mode)
        try {
            console.log('Calling Edge Function...');
            const { data, error } = await supabase.functions.invoke('analyze-image', {
                body: { imageData, mimeType }
            });

            console.log('Edge Function response:', { data, error });

            if (error) {
                console.error('Edge Function error:', error);
                throw error;
            }

            if (data?.analysis) {
                return data.analysis;
            }
        } catch (edgeFunctionError) {
            console.error('Edge Function failed:', edgeFunctionError);
            console.log('Falling back to direct API');
        }

        // Fallback to direct API call (development mode)
        if (GEMINI_API_KEY) {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const imagePart = {
                inlineData: {
                    data: imageData,
                    mimeType: mimeType,
                },
            };

            const prompt = "Analyze this jewelry image and suggest specific lighting enhancements to make it look more premium. Focus on reflections, contrast, and color balance for silver and crystals. Keep it concise.";

            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();
            return responseText;
        }

        throw new Error("No Gemini API available (neither Edge Function nor API key)");
    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        throw new Error("Failed to analyze image lighting");
    }
};
