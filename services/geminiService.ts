import { GoogleGenAI, Content } from "@google/genai";
import { Message } from '../types';

class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Per instructions, the API key is assumed to be available in process.env.API_KEY.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  /**
   * Sends a message to a chat session and streams the response.
   * @param message The new message from the user.
   * @param history The previous messages in the conversation.
   * @returns An async generator that yields response text chunks.
   */
  async *sendMessageStream(message: string, history: Message[]): AsyncGenerator<string> {
    // Map the application's message format to the Gemini API's Content format.
    const geminiHistory: Content[] = history.map(msg => ({
      role: msg.sender,
      parts: [{ text: msg.text }],
    }));

    const chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      history: geminiHistory,
    });

    try {
      const result = await chat.sendMessageStream({ message });
      for await (const chunk of result) {
        // Per guidelines, chunk.text is the correct way to access the text.
        if (chunk.text) {
          yield chunk.text;
        }
      }
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      yield "Sorry, I encountered an error and could not get a response.";
    }
  }

  /**
   * Generates a short title for a conversation based on the initial prompt.
   * @param prompt The user's first message in a conversation.
   * @returns A promise that resolves to a short title string.
   */
  async generateTitle(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a short, concise title (max 4 words) for this user prompt: "${prompt}"`,
      });
      // Per guidelines, response.text is the correct way to get the text.
      return response.text.trim().replace(/"/g, ''); // Clean up quotes that the model might add.
    } catch (error) {
      console.error("Error generating title:", error);
      // Fallback title in case of an error.
      return "New Conversation";
    }
  }
}

export const geminiService = new GeminiService();
