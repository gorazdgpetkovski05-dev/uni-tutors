import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { Message } from '../../types';
import { Send, X, MessageSquare } from 'lucide-react';

interface MessageThreadProps {
  enrollmentId: string;
  currentUserId: string;
  otherUserName: string;
  onClose: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ enrollmentId, currentUserId, otherUserName, onClose }) => {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Mark unread messages as read
    supabase.from('messages').update({ read: true })
      .eq('enrollment_id', enrollmentId)
      .neq('sender_id', currentUserId)
      .eq('read', false)
      .then();

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${enrollmentId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `enrollment_id=eq.${enrollmentId}` },
        (payload) => {
          const msg = payload.new as Message;
          setMessages(prev => [...prev, msg]);
          if (msg.sender_id !== currentUserId) {
            supabase.from('messages').update({ read: true }).eq('id', msg.id).then();
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [enrollmentId, currentUserId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim().slice(0, 2000);
    if (!content || sending) return;
    setSending(true);
    setNewMessage('');
    await supabase.from('messages').insert({ enrollment_id: enrollmentId, sender_id: currentUserId, content });
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            <h3 className="font-bold text-gray-900 dark:text-white">{otherUserName}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[200px]">
          {messages.length === 0 && (
            <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">{t('noMessages')}</p>
          )}
          {messages.map(msg => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                  isOwn
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-md'
                }`}>
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isOwn ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-5 py-4 border-t border-gray-200 dark:border-slate-700 flex gap-2">
          <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} maxLength={2000}
            placeholder={t('typeMessage')}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" disabled={sending || !newMessage.trim()}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-1.5 text-sm font-medium">
            <Send className="h-4 w-4" /> {t('sendMessage')}
          </button>
        </form>
      </div>
    </div>
  );
};
