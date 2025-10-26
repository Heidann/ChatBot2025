import React from 'react';
import { GeminiIcon } from './icons';

interface SuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  'Giải thích về điện toán lượng tử một cách đơn giản',
  'Gợi ý một vài ý tưởng quà tặng sáng tạo cho bé 10 tuổi?',
  'Viết một câu chuyện ngắn về một con robot thân thiện',
  'Làm thế nào để pha một tách cà phê ngon?',
];

const Suggestions: React.FC<SuggestionsProps> = ({ onSuggestionClick }) => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-4 text-center">
        <GeminiIcon className="w-16 h-16 mb-4 text-gray-500" />
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Xin chào, tôi là Trợ lý AI</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">Tôi có thể giúp gì cho bạn hôm nay?</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg text-left text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;
