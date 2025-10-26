// FIX: The original file content was missing. This content has been generated to create a functional application.
import { GoogleGenAI, Chat } from "@google/genai";
import { Message } from "../types";

// FIX: Added API key validation as per guidelines.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

// FIX: Initialize GoogleGenAI with a named apiKey parameter as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chat: Chat | null = null;

// FIX: Use 'gemini-2.5-flash' as the default model for basic text tasks.
const MODEL_NAME = 'gemini-2.5-flash';

export const startChat = () => {
  // FIX: Use ai.chats.create to start a new chat session as per guidelines.
  chat = ai.chats.create({
    model: MODEL_NAME,
    history: [],
  });
};

export async function* sendMessageStream(
  message: string,
  history: Message[]
): AsyncGenerator<string> {
  if (!chat) {
    // FIX: Use ai.chats.create with history to continue an existing conversation.
    chat = ai.chats.create({
      model: MODEL_NAME,
      history: history.map(msg => ({
        // FIX: Map sender to the correct role for the Gemini API.
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
    });
  }

  try {
    // FIX: Use chat.sendMessageStream for streaming responses as per guidelines.
    const result = await chat.sendMessageStream({ message });
    for await (const chunk of result) {
      // FIX: Access the text content directly from the chunk using chunk.text.
      const chunkText = chunk.text;
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    yield "Sorry, I encountered an error. Please try again.";
  }
}
