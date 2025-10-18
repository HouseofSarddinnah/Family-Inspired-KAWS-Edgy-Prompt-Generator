
import { GoogleGenAI, Type } from "@google/genai";
import { PROMPT_OPTIONS_CONFIG } from '../constants';
import { PromptOptions } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getResponseSchema = () => {
    const properties: { [key: string]: any } = {};
    for (const key in PROMPT_OPTIONS_CONFIG) {
        const config = PROMPT_OPTIONS_CONFIG[key as keyof typeof PROMPT_OPTIONS_CONFIG];
        if (config.isMulti) {
            properties[key] = {
                type: Type.ARRAY,
                description: `A selection of ${config.label}. Choose between 1 and 3 relevant options from the list.`,
                items: {
                    type: Type.STRING,
                    enum: config.options,
                },
            };
        } else {
            properties[key] = {
                type: Type.STRING,
                description: `A single selection for ${config.label}. Choose one relevant option.`,
                enum: config.options,
            };
        }
    }
    return {
        type: Type.OBJECT,
        properties,
    };
};

export const generateSmartRandomizedOptions = async (): Promise<PromptOptions> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a creative director for KAWS-style collectible art. Your task is to generate a random, but cohesive and exciting, set of options for an AI art prompt. 
      Ensure the selections are thematically consistent. For example, a 'Cyberpunk' theme should have a corresponding scene like 'Cyberpunk cityscape' and colors like 'Glow in the Dark' or 'Liquid Metal'. A 'Family' group should have appropriate poses like 'Family huddle'.
      Generate a set of options based on the provided schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: getResponseSchema(),
      },
    });

    const jsonText = response.text.trim();
    const parsedOptions = JSON.parse(jsonText);
    
    // Ensure all keys are present, even if empty, to match the PromptOptions type
    const finalOptions: Partial<PromptOptions> = {};
    for (const key in PROMPT_OPTIONS_CONFIG) {
        const typedKey = key as keyof PromptOptions;
        if (PROMPT_OPTIONS_CONFIG[typedKey].isMulti) {
            finalOptions[typedKey] = parsedOptions[typedKey] || [];
        } else {
            finalOptions[typedKey] = parsedOptions[typedKey] || '';
        }
    }

    return finalOptions as PromptOptions;

  } catch (error) {
    console.error("Error generating smart randomized options:", error);
    throw new Error("Failed to generate options from AI. Please try again.");
  }
};
