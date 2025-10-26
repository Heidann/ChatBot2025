import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import { Conversation, Message } from './types';
import { geminiService } from './services/geminiService';

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Load conversations from local storage on initial render
  useEffect(() => {
    try {
      const storedConversationsRaw = localStorage.getItem('conversations');
      const storedConversations = storedConversationsRaw ? JSON.parse(storedConversationsRaw) : [];
      setConversations(storedConversations);

      const storedActiveIdRaw = localStorage.getItem('activeConversationId');
      if (storedActiveIdRaw) {
        const activeId = JSON.parse(storedActiveIdRaw);
        // Ensure the active ID from storage still corresponds to an existing conversation
        if (storedConversations.some((c: Conversation) => c.id === activeId)) {
          setActiveConversationId(activeId);
        }
      }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        localStorage.removeItem('conversations');
        localStorage.removeItem('activeConversationId');
    }
  }, []);

  // Save conversations to local storage whenever they change
  useEffect(() => {
    try {
        localStorage.setItem('conversations', JSON.stringify(conversations));
    } catch (error) {
        console.error("Failed to save conversations to localStorage", error);
    }
  }, [conversations]);

  // Save active conversation ID to local storage when it changes
  useEffect(() => {
    try {
        if (activeConversationId) {
            localStorage.setItem('activeConversationId', JSON.stringify(activeConversationId));
        } else {
            localStorage.removeItem('activeConversationId');
        }
    } catch(error) {
        console.error("Failed to save active conversation ID to localStorage", error);
    }
  }, [activeConversationId]);

  const activeConversation = useMemo(() => {
    return conversations.find(c => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations(prevConversations => {
      const newConversations = prevConversations.filter(c => c.id !== id);
      if (activeConversationId === id) {
        setActiveConversationId(newConversations.length > 0 ? newConversations[0].id : null);
      }
      return newConversations;
    });
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    let currentConversationId = activeConversationId;
    let conversationHistory: Message[] = [];
    let isNewChat = false;

    if (!currentConversationId) {
      isNewChat = true;
      const newConvId = crypto.randomUUID();
      const newConversation: Conversation = { id: newConvId, title: 'New Chat', messages: [] };
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversationId(newConvId);
      currentConversationId = newConvId;
    } else {
      const conv = conversations.find(c => c.id === currentConversationId);
      if (conv) {
        conversationHistory = conv.messages;
        if (conversationHistory.length === 0) {
          isNewChat = true;
        }
      }
    }

    const userMessage: Message = { id: crypto.randomUUID(), sender: 'user', text: message };

    setConversations(prev => prev.map(c =>
      c.id === currentConversationId ? { ...c, messages: [...c.messages, userMessage] } : c
    ));
    setIsLoading(true);

    const modelMessage: Message = { id: crypto.randomUUID(), sender: 'model', text: '' };

    try {
      if (isNewChat) {
        geminiService.generateTitle(message).then(title => {
          setConversations(prev => prev.map(c =>
            c.id === currentConversationId ? { ...c, title } : c
          ));
        });
      }

      for await (const chunk of geminiService.sendMessageStream(message, conversationHistory)) {
        modelMessage.text += chunk;
        setConversations(prev =>
          prev.map(c => {
            if (c.id === currentConversationId) {
              const existingMessages = c.messages;
              const lastMessage = existingMessages[existingMessages.length - 1];
              if (lastMessage?.id === modelMessage.id) {
                return { ...c, messages: [...existingMessages.slice(0, -1), { ...modelMessage }] };
              } else {
                return { ...c, messages: [...existingMessages, modelMessage] };
              }
            }
            return c;
          })
        );
      }
    } catch (error) {
      console.error("Error streaming message:", error);
      const errorMessage: Message = { id: crypto.randomUUID(), sender: 'model', text: 'An error occurred. Please try again.' };
      setConversations(prev => prev.map(c =>
        c.id === currentConversationId ? { ...c, messages: [...c.messages, errorMessage] } : c
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-white dark:bg-gray-900 font-sans overflow-hidden">
      <div
        className={`fixed inset-0 z-10 bg-black/50 md:hidden ${isSidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <main className="flex-1 flex flex-col h-full relative">
        <ChatView
          messages={activeConversation?.messages || []}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          setSidebarOpen={setSidebarOpen}
        />
      </main>
    </div>
  );
}

export default App;
