import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StoryParams, Scene, Character } from '../types';

const storyGenerationModel = "gemini-2.5-flash";
const imageGenerationModel = 'imagen-3.0-generate-002';

const getAi = (apiKey: string) => {
    if (!apiKey) {
        throw new Error("API Key not set. Please go to Settings to add your key.");
    }
    return new GoogleGenAI({ apiKey });
};

const storySchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A short, catchy title for the story, written in the requested language."
        },
        scenes: {
            type: Type.ARRAY,
            description: "The different scenes that make up the story.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: {
                        type: Type.STRING,
                        description: "The narrative text for this scene, in the requested language. This should be a paragraph or two."
                    },
                    imagePrompt: {
                        type: Type.STRING,
                        description: "A detailed, descriptive prompt IN ENGLISH for an AI image generator to create a visual for this scene. The prompt should describe characters, setting, and action in a whimsical, vibrant, and friendly art style suitable for a children's book. Do not include any story text in this prompt."
                    }
                },
                required: ["text", "imagePrompt"]
            }
        },
        characters: {
            type: Type.ARRAY,
            description: "A list of the main characters in the story.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "The character's name, in the requested language."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A short description of the character's appearance and personality, IN ENGLISH, to be used for generating a portrait image."
                    }
                },
                required: ["name", "description"]
            }
        }
    },
    required: ["title", "scenes", "characters"]
};

export const generateStoryContent = async (params: StoryParams, apiKey: string): Promise<{title: string; scenes: Omit<Scene, 'id' | 'imageUrl'>[]; characters: Omit<Character, 'imageUrl'>[]}> => {
  const prompt = `
    Generate a complete and engaging story for a ${params.age}-year-old ${params.gender}, with the theme of "${params.theme}".
    The story and its title MUST be written in the following language: ${params.language}.

    The story must have a very clear and well-defined structure:
    1.  **Introduction:** Introduce the main character(s) and the setting. Establish the initial situation. (1-2 scenes)
    2.  **Rising Action:** Introduce a problem, a challenge, or a goal for the character. Build up suspense or excitement. (2-3 scenes)
    3.  **Climax:** The turning point of the story where the character faces the main challenge. This should be the most exciting part. (1 scene)
    4.  **Falling Action:** Show the immediate results of the climax. Things start to wind down. (1-2 scenes)
    5.  **Learning:** The character learns something important or gains a new perspective. This can be a moral lesson or a personal growth moment. (1 scene)
    6.  **Resolution & Moral:** The story concludes, the problem is solved, and there's a simple, positive moral or lesson learned. (1 scene)

    The total story should be broken down into 6 to 8 scenes.
    Each scene should have a narrative part (in ${params.language}) and a separate, detailed image prompt (in English).
    Identify 1-3 main characters and provide their names (in ${params.language}) and a description of them (in English).
    The tone must be magical, heartwarming, and full of wonder. The story should elevate the curiosity and imagination by creating possibilities in the fertile minds of young children on the topic they are already feeling excited about.
    Structure the output as a JSON object that strictly follows the provided schema.
  `;

  try {
    const ai = getAi(apiKey);
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: storyGenerationModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storySchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    if (!parsed.title || !Array.isArray(parsed.scenes) || !Array.isArray(parsed.characters)) {
        throw new Error("Invalid story structure received from API.");
    }
    
    return parsed;

  } catch (error) {
    console.error("Error generating story content:", error);
    if (error instanceof Error && error.message.includes("API Key not set")) {
        throw error;
    }
    throw new Error("Failed to create the story's plot. Please try a different theme.");
  }
};

export const generateImage = async (prompt: string, apiKey: string): Promise<string> => {
    const fullPrompt = `${prompt}, in the style of a vibrant and whimsical children's book illustration, colorful, friendly characters, soft lighting, detailed and magical.`;
    try {
        const ai = getAi(apiKey);
        const response = await ai.models.generateImages({
            model: imageGenerationModel,
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '9:16',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof Error && error.message.includes("API Key not set")) {
            throw error;
        }
        throw new Error("Failed to create an image for a scene.");
    }
};

export const generateCharacterImage = async (prompt: string, apiKey: string): Promise<string> => {
    const fullPrompt = `Portrait of ${prompt}, in the style of a vibrant and whimsical children's book character design, friendly face, centered, white background, detailed and magical.`;
     try {
        const ai = getAi(apiKey);
        const response = await ai.models.generateImages({
            model: imageGenerationModel,
            prompt: fullPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated for character.");
        }
    } catch (error) {
        console.error("Error generating character image:", error);
        if (error instanceof Error && error.message.includes("API Key not set")) {
            throw error;
        }
        throw new Error("Failed to create an image for a character.");
    }
}