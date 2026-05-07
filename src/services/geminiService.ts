import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is not defined in the environment.");
  }
  return key || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export enum HealthStatus {
  HEALTHY = "HEALTHY",
  NEUTRAL = "NEUTRAL",
  HARMFUL = "HARMFUL",
}

export interface Ingredient {
  name: string;
  quantity: string;
  healthStatus: HealthStatus;
  explanation: string;
}

export interface ProductAnalysis {
  productName: string;
  estimatedServingSize: string;
  ingredients: Ingredient[];
  overallHealthScore: number; // 0 to 100
  summary: string;
  isIndianProduct: boolean;
}

export async function analyzeProduct(productName: string): Promise<ProductAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the Indian food product: "${productName}". 
    Provide exact ingredients with their estimated quantities (if not specified, use common industry standards for this product). 
    Categorize each ingredient as HEALTHY, NEUTRAL, or HARMFUL specifically for regular consumption. 
    Focus on Indian market variations of this product. Double check common hidden ingredients like preservatives (e.g., INS numbers), artificial colors, and high fructose corn syrup.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          estimatedServingSize: { type: Type.STRING },
          ingredients: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                quantity: { type: Type.STRING },
                healthStatus: { 
                  type: Type.STRING, 
                  description: "One of: HEALTHY, NEUTRAL, HARMFUL" 
                },
                explanation: { type: Type.STRING }
              },
              required: ["name", "quantity", "healthStatus", "explanation"]
            }
          },
          overallHealthScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          isIndianProduct: { type: Type.BOOLEAN }
        },
        required: ["productName", "ingredients", "overallHealthScore", "summary", "isIndianProduct"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || "{}");
    return data as ProductAnalysis;
  } catch (e) {
    throw new Error("Failed to parse analysis results.");
  }
}
