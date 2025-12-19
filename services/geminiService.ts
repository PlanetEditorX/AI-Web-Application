
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType, ChatMessage } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.API_KEY || '';
    this.ai = new GoogleGenAI({ apiKey });
  }

  async sendMessage(
    model: ModelType,
    history: ChatMessage[],
    message: string,
    image?: { data: string; mimeType: string }
  ): Promise<string> {
    // Convert history to Gemini format
    const contents = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: msg.parts.map(p => {
          if (p.text) return { text: p.text };
          if (p.inlineData) return { inlineData: p.inlineData };
          return { text: '' };
      })
    }));

    // Add current user message
    const currentParts: any[] = [{ text: message }];
    if (image) {
      currentParts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      }
    });

    return response.text || "No response received.";
  }

  async *sendMessageStream(
    model: ModelType,
    history: ChatMessage[],
    message: string,
    image?: { data: string; mimeType: string }
  ) {
    const contents = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: msg.parts.map(p => {
          if (p.text) return { text: p.text };
          if (p.inlineData) return { inlineData: p.inlineData };
          return { text: '' };
      })
    }));

    const currentParts: any[] = [{ text: message }];
    if (image) {
      currentParts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    const stream = await this.ai.models.generateContentStream({
      model: model,
      contents: contents,
    });

    for await (const chunk of stream) {
      yield chunk.text || "";
    }
  }
}

export const geminiService = new GeminiService();
