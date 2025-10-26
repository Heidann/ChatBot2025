import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { PlusIcon, SunIcon, MoonIcon, GeminiIcon, TrashIcon } from './icons';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    conversations, 
    activeConversationId,
    onNewChat,
    onSelectConversation,
    onDeleteConversation,
    isOpen,
}) => {
  const { theme, toggleTheme } = useTheme();

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent onSelectConversation from firing
    onDeleteConversation(id);
  };

  return (
    <aside
      className={`absolute md:relative flex flex-col h-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white transition-transform duration-300 ease-in-out z-20 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 w-64 p-2`}
    >
      <div className="p-2">
        <button
            onClick={onNewChat}
            className="flex items-center gap-3 w-full p-3 mb-4 rounded-full text-left hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
            <PlusIcon className="w-5 h-5" />
            <span className="font-semibold">New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Recent</h2>
        <div className="flex flex-col gap-1">
            {conversations.map(conv => (
                <div key={conv.id} className="relative group">
                    <button
                        onClick={() => onSelectConversation(conv.id)}
                        className={`w-full text-left p-3 rounded-lg truncate transition-colors ${
                            activeConversationId === conv.id 
                            ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300' 
                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        title={conv.title}
                    >
                        {conv.title}
                    </button>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={(e) => handleDelete(e, conv.id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                            aria-label="Delete chat"
                         >
                            <TrashIcon className="w-4 h-4" />
                         </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full p-3 rounded-lg text-left hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === 'light' ? (
            <MoonIcon className="w-5 h-5" />
          ) : (
            <SunIcon className="w-5 h-5" />
          )}
          <span>{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
