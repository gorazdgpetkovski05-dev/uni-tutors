
import React, { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { chatWithGemini } from '../services/geminiService';

export const AiTutor: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    {role: 'ai', text: 'Hi! I am your FINKI AI Tutor. Ask me anything about your courses!'}
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if(!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, {role: 'user', text: userMsg}]);
    setInput('');
    setLoading(true);

    const response = await chatWithGemini(userMsg);
    
    setMessages(prev => [...prev, {role: 'ai', text: response}]);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="font-bold">AI Tutor</h3>
        </div>
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/90">Powered by Gemini</span>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
              ? 'bg-indigo-600 text-white rounded-br-none' 
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-white border-t border-gray-100">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Explain recursion..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
