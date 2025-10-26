// FIX: The original file content was missing. This content has been generated to create a functional application.
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import { Conversation, Message } from './types';
import { startChat, sendMessageStream } from './services/geminiService';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const savedConvos = localStorage.getItem('conversations');
    return savedConvos ? JSON.parse(savedConvos) : [];
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Effect to load the first conversation or set to null if none exist
  useEffect(() => {
    if (conversations.length > 0 && !activeConversationId) {
      setActiveConversationId(conversations[0].id);
    } else if (conversations.length === 0) {
      setActiveConversationId(null);
    }
  }, [conversations, activeConversationId]);
  
  // Effect to save conversations to local storage
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const handleNewChat = () => {
    startChat();
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const handleSelectConversation = (id: string) => {
    startChat(); // Re-initialize chat session for the selected conversation
    setActiveConversationId(id);
    setSidebarOpen(false); // Close sidebar on mobile
  };
  
  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
        // If the active conversation is deleted, select the next one or none
        const remainingConversations = conversations.filter(c => c.id !== id);
        setActiveConversationId(remainingConversations.length > 0 ? remainingConversations[0].id : null);
    }
  };

  const handleSendMessage = async (input: string) => {
    if (!input.trim()) return;

    let currentConversationId = activeConversationId;
    let newConversationCreated = false;

    // If there's no active conversation, create a new one
    if (!currentConversationId) {
        const newConversation: Conversation = {
            id: uuidv4(),
            title: input.length > 30 ? `${input.substring(0, 27)}...` : input,
            messages: [],
        };
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        currentConversationId = newConversation.id;
        newConversationCreated = true;
        startChat();
    }
    
    const userMessage: Message = { id: uuidv4(), sender: 'user', text: input };
    
    // Update state immediately with user's message
    setConversations(prev =>
      prev.map(c =>
        c.id === currentConversationId
          ? { ...c, messages: [...c.messages, userMessage] }
          : c
      )
    );

    setIsLoading(true);

    const modelMessage: Message = { id: uuidv4(), sender: 'model', text: '' };
    
    const conversationForHistory = conversations.find(c => c.id === currentConversationId);
    const history = newConversationCreated ? [] : conversationForHistory?.messages || [];


    try {
        const stream = sendMessageStream(input, history);
        for await (const chunk of stream) {
            modelMessage.text += chunk;
            setConversations(prev =>
                prev.map(c => {
                    if (c.id === currentConversationId) {
                        const otherMessages = c.messages.filter(m => m.id !== modelMessage.id);
                        return { ...c, messages: [...otherMessages, { ...modelMessage }] };
                    }
                    return c;
                })
            );
        }
    } catch (error) {
        console.error("Failed to get response stream:", error);
        modelMessage.text = "Error: Could not get a response from the model.";
        setConversations(prev =>
            prev.map(c => {
                if (c.id === currentConversationId) {
                    const otherMessages = c.messages.filter(m => m.id !== modelMessage.id);
                    return { ...c, messages: [...otherMessages, modelMessage] };
                }
                return c;
            })
        );
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans text-base antialiased bg-gray-50 dark:bg-gray-950">
       <div 
        className={`fixed inset-0 bg-black/50 z-10 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      ></div>
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main className="flex-1 flex flex-col h-full">
        <ChatView
          messages={activeConversation?.messages || []}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          setSidebarOpen={setSidebarOpen}
        />
      </main>
    </div>
  );
};

export default App;