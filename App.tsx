
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ModelType, AIApp } from './types';
import { geminiService } from './services/geminiService';
import ChatMessageBubble from './components/ChatMessageBubble';
import ChatInput from './components/ChatInput';

const AI_APPS: AIApp[] = [
  { id: 'internal', name: 'Gemini Client', url: 'internal', icon: '✨', color: 'text-blue-500' },
  { id: 'copilot', name: 'Copilot', url: 'https://copilot.microsoft.com/', icon: '🌊', color: 'text-teal-500' },
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/', icon: '🤖', color: 'text-green-500' },
  { id: 'gemini-web', name: 'Gemini Web', url: 'https://gemini.google.com/app', icon: '♊', color: 'text-purple-500' },
  { id: 'grok', name: 'Grok', url: 'https://grok.com/', icon: '𝕏', color: 'text-zinc-400' },
];

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeApp, setActiveApp] = useState<AIApp>(AI_APPS[0]);
  const [showAppMenu, setShowAppMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'initial',
          role: 'model',
          parts: [{ text: "Hello! I'm your AI Assistant. How can I help you today?" }],
          timestamp: Date.now()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (
    text: string, 
    model: ModelType, 
    image?: { data: string; mimeType: string }
  ) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      parts: [
        { text },
        ...(image ? [{ inlineData: image }] : [])
      ],
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let fullResponse = '';
      const modelMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: modelMessageId,
        role: 'model',
        parts: [{ text: '' }],
        timestamp: Date.now()
      }]);

      const stream = geminiService.sendMessageStream(model, messages, text, image);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === modelMessageId 
            ? { ...msg, parts: [{ text: fullResponse }] }
            : msg
        ));
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        parts: [{ text: "Error: Could not reach the AI service. Please check your API key." }],
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-black overflow-hidden font-sans">
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header with App Selector */}
        <header className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-black/80 ios-blur sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 safe-top">
          <div className="relative">
            <button 
              onClick={() => setShowAppMenu(!showAppMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 active:scale-95 transition-all border border-zinc-200 dark:border-zinc-700"
            >
              <span className={`text-lg ${activeApp.color}`}>{activeApp.icon}</span>
              <span className="text-sm font-semibold pr-1">{activeApp.name}</span>
              <svg className={`w-4 h-4 transition-transform ${showAppMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* iOS Style Popover Menu */}
            {showAppMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 dark:bg-zinc-900/95 ios-blur rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                {AI_APPS.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => {
                      setActiveApp(app);
                      setShowAppMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-3 gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <span className={`text-xl ${app.color}`}>{app.icon}</span>
                    <span className={`text-sm font-medium ${activeApp.id === app.id ? 'text-blue-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {app.name}
                    </span>
                    {activeApp.id === app.id && (
                      <svg className="ml-auto w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
             <div className="text-[10px] px-2 py-0.5 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold uppercase tracking-tighter">
                Live
             </div>
             <button className="p-2 -mr-2 text-zinc-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             </button>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 relative overflow-hidden">
          {activeApp.id === 'internal' ? (
            <div className="h-full flex flex-col">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth">
                <div className="max-w-3xl mx-auto w-full">
                  {messages.map((msg) => (
                    <ChatMessageBubble key={msg.id} message={msg} />
                  ))}
                  {isLoading && messages[messages.length-1].role === 'user' && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-white dark:bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-none border border-zinc-200 dark:border-zinc-700">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="max-w-3xl mx-auto w-full">
                <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
              </div>
            </div>
          ) : (
            <div className="h-full w-full bg-white dark:bg-zinc-900 flex flex-col">
              {/* Web View Iframe */}
              <iframe 
                src={activeApp.url} 
                className="flex-1 w-full border-none"
                title={activeApp.name}
                sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
              />
              {/* Fallback Overlay for potential iframe blocks */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity bg-black/5">
                <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 pointer-events-auto">
                  <p className="text-sm mb-2 text-center">If the page doesn't load, some AI providers block embedding.</p>
                  <a 
                    href={activeApp.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2 bg-blue-500 text-white rounded-lg font-medium text-sm"
                  >
                    Open Directly
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
