
import React, { useState, useRef } from 'react';
import { ModelType } from '../types';

interface ChatInputProps {
  onSend: (message: string, model: ModelType, image?: { data: string; mimeType: string }) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [model, setModel] = useState<ModelType>(ModelType.FLASH);
  const [image, setImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((text.trim() || image) && !isLoading) {
      onSend(text, model, image ? { data: image.data, mimeType: image.mimeType } : undefined);
      setText('');
      setImage(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage({
          data: base64String,
          mimeType: file.type,
          preview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 bg-white/80 dark:bg-black/80 ios-blur border-t border-zinc-200 dark:border-zinc-800 safe-bottom">
      {image && (
        <div className="relative inline-block mb-3">
          <img src={image.preview} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-blue-500" />
          <button 
            onClick={() => setImage(null)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <button
            type="button"
            onClick={() => setModel(prev => prev === ModelType.FLASH ? ModelType.PRO : ModelType.FLASH)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              model === ModelType.PRO 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            }`}
          >
            {model === ModelType.PRO ? 'Gemini 3 Pro' : 'Gemini 3 Flash'}
          </button>
        </div>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-blue-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything..."
              rows={1}
              className="w-full max-h-32 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none hide-scrollbar text-[16px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={(!text.trim() && !image) || isLoading}
            className={`p-3 rounded-full transition-all ${
              (!text.trim() && !image) || isLoading
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                : 'bg-blue-600 text-white shadow-md active:scale-95'
            }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-6 h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
