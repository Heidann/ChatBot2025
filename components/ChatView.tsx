// FIX: The original file content was missing. This content has been generated to create a functional application.
import React, { useRef, useEffect } from 'react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import Suggestions from './Suggestions';
import { Message } from '../types';
import { MenuIcon } from './icons';

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, onSendMessage, isLoading, setSidebarOpen }) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat view when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
    // Focus the input after clicking a suggestion
    chatInputRef.current?.focus();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
        <header className="md:hidden flex items-center p-2 border-b border-gray-200 dark:border-gray-700">
            <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
                <MenuIcon className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold ml-2 text-gray-900 dark:text-white">Chat</h1>
        </header>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <Suggestions onSuggestionClick={handleSuggestionClick} />
          ) : (
            messages.map(message => <ChatBubble key={message.id} message={message} />)
          )}
          {isLoading && <ChatBubble message={{ id: 'loading', sender: 'model', text: 'Thinking...' }} />}
        </div>
      </div>
      
      <ChatInput ref={chatInputRef} onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatView;
