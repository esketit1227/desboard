
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Loader2, Sparkles } from 'lucide-react';
import { ChatMessage, TechPackData } from '../types';
import { createTechPackChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';

interface Props {
  techData: TechPackData | null;
}

const ChatBotView: React.FC<Props> = ({ techData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
        id: 'welcome', 
        role: 'model', 
        text: "Hi! I'm your Technical Design Assistant. I can help with fabric choices, construction details, or manufacturing questions. How can I assist you today?" 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize or re-initialize chat when tech data changes significantly (optional, but good for context)
  useEffect(() => {
    if (isOpen && !chatSession) {
        setChatSession(createTechPackChat(techData));
    }
  }, [isOpen, techData]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatSession) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: inputText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
        const result = await chatSession.sendMessageStream({ message: userMsg.text });
        
        const botMsgId = (Date.now() + 1).toString();
        // Add placeholder for bot message
        setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '', isStreaming: true }]);

        let fullText = '';
        for await (const chunk of result) {
            const c = chunk as GenerateContentResponse;
            if (c.text) {
                fullText += c.text;
                setMessages(prev => 
                    prev.map(msg => msg.id === botMsgId ? { ...msg, text: fullText } : msg)
                );
            }
        }
        
        // Finalize
        setMessages(prev => 
            prev.map(msg => msg.id === botMsgId ? { ...msg, isStreaming: false } : msg)
        );

    } catch (error) {
        console.error("Chat error", error);
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            text: "I'm having trouble connecting to the design server right now. Please check your API key." 
        }]);
    } finally {
        setIsLoading(false);
        // Focus back on input
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
      }
  };

  return (
    <>
        {/* Floating Toggle Button */}
        {!isOpen && (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-black text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
            >
                <div className="absolute inset-0 bg-blue-500 rounded-full opacity-0 group-hover:opacity-20 animate-ping"></div>
                <MessageCircle size={24} />
                {/* Notification dot if needed */}
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
        )}

        {/* Chat Window */}
        {isOpen && (
            <div className="fixed bottom-6 right-6 z-[60] w-[350px] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-scale-in origin-bottom-right">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-md">
                            <Sparkles size={18} fill="currentColor" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold text-gray-900 leading-none">Design Assistant</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-[11px] text-gray-500 font-medium">Gemini 3 Pro</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <Minimize2 size={18} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-black text-white' : 'bg-white border border-gray-200 text-blue-600'}`}>
                                {msg.role === 'user' ? <User size={14} /> : <Bot size={16} />}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-black text-white rounded-tr-none' 
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                            }`}>
                                {msg.text || (msg.isStreaming ? <span className="animate-pulse">Thinking...</span> : '')}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="relative flex items-center bg-gray-100 rounded-full px-4 py-2 ring-1 ring-transparent focus-within:ring-black/10 focus-within:bg-white transition-all">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about fabrics, fit, or costs..."
                            className="flex-1 bg-transparent border-none outline-none text-[14px] placeholder-gray-400 min-w-0"
                            disabled={isLoading}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!inputText.trim() || isLoading}
                            className={`ml-2 p-2 rounded-full transition-all ${
                                inputText.trim() && !isLoading
                                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default ChatBotView;
