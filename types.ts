// FIX: Replaced placeholder with actual type definitions for the chat application.
export interface Message {
  id: string;
  sender: 'user' | 'model';
  text: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}
