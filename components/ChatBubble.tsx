import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { GeminiIcon } from './icons';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUserModel = message.sender === 'model';

  return (
    <div className={`flex items-start gap-4 py-4 ${!isUserModel ? 'flex-row-reverse' : ''}`}>
      {isUserModel && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <GeminiIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
        </div>
      )}
      <div
        className={`max-w-xl p-4 rounded-lg shadow-md ${
          isUserModel
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            : 'bg-blue-600 text-white'
        }`}
      >
        {isUserModel ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.text}
                </ReactMarkdown>
            </div>
        ) : (
            <p className="whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
