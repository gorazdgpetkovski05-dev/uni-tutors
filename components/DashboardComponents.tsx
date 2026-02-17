
import React, { useState } from 'react';
import { User, Achievement } from '../types';
import { Trophy, Flame, Star, Zap, MessageSquare, Send } from 'lucide-react';
import { chatWithGemini } from '../services/geminiService';

export const XPBar: React.FC<{ user: User }> = ({ user }) => {
  // Quadratic Formula: XP = 500 * (Level - 1)^2
  // XP needed for current level start
  const currentLevelBaseXP = 500 * Math.pow(user.level - 1, 2);
  // XP needed for next level start
  const nextLevelBaseXP = 500 * Math.pow(user.level, 2);
  
  const xpNeededForLevel = nextLevelBaseXP - currentLevelBaseXP;
  const xpProgressInLevel = user.xp - currentLevelBaseXP;
  
  // Guard against divide by zero or negative
  const percentage = Math.min(100, Math.max(0, (xpProgressInLevel / xpNeededForLevel) * 100));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Current Level</span>
          <div className="text-3xl font-bold text-indigo-600">Lvl {user.level}</div>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-gray-600">{user.xp} / {nextLevelBaseXP} XP</span>
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="mt-3 text-xs text-gray-400">Earn {nextLevelBaseXP - user.xp} more XP to reach Level {user.level + 1}</p>
    </div>
  );
};

export const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const IconMap: any = {
    'graduation-cap': Star,
    'code': Zap,
    'calculator': Trophy,
    'flame': Flame
  };
  const Icon = IconMap[achievement.icon] || Star;

  return (
    <div className={`p-4 rounded-xl border flex items-center gap-4 ${achievement.unlocked ? 'bg-white border-gray-100 shadow-sm' : 'bg-gray-50 border-dashed border-gray-200 opacity-60'}`}>
      <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h4 className={`font-bold ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>{achievement.title}</h4>
        <p className="text-xs text-gray-500">{achievement.description}</p>
      </div>
    </div>
  );
};

export const AiTutor: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([
    {role: 'ai', text: 'Hi! I am your FINKI AI Tutor. Ask me anything about your subjects!'}
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
