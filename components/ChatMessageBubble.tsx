
import React from 'react';
import { ChatMessage } from '../types';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm ${
        isUser 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200 dark:border-zinc-700'
      }`}>
        {message.parts.map((part, idx) => (
          <div key={idx} className="space-y-2">
            {part.inlineData && (
              <img 
                src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                alt="Uploaded content" 
                className="rounded-lg max-h-60 w-full object-cover mb-2"
              />
            )}
            {part.text && (
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed select-text">
                {part.text}
              </p>
            )}
          </div>
        ))}
        <div className={`text-[10px] mt-1 opacity-50 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
