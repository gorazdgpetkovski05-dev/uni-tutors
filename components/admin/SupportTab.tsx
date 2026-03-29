import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Send } from 'lucide-react';
import { SupportTicket } from '../../types';

interface SupportTabProps {
  tickets: SupportTicket[];
  updateTicketStatus: (id: string, status: string) => void;
  sendReply: (ticketId: string, message: string) => void;
  t: (k: any) => string;
}

export const SupportTab: React.FC<SupportTabProps> = ({ tickets, updateTicketStatus, sendReply, t }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const handleReply = (ticketId: string) => {
    if (!replyText[ticketId]?.trim()) return;
    sendReply(ticketId, replyText[ticketId].trim());
    setReplyText({ ...replyText, [ticketId]: '' });
  };

  return (
    <div className="space-y-3">
      {tickets.map(ticket => (
        <div key={ticket.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <button onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
            <div className="text-left">
              <p className="font-bold text-gray-900 dark:text-white">{ticket.subject}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{(ticket as any).user?.full_name} • {new Date(ticket.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={ticket.status} onChange={e => updateTicketStatus(ticket.id, e.target.value)} onClick={e => e.stopPropagation()}
                className="px-2 py-1 text-xs border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
                <option value="open">{t('open')}</option>
                <option value="in_progress">{t('inProgress')}</option>
                <option value="resolved">{t('resolved')}</option>
                <option value="closed">{t('closed')}</option>
              </select>
              {expanded === ticket.id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </div>
          </button>

          {expanded === ticket.id && (
            <div className="p-4 border-t border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{ticket.description}</p>

              <div className="space-y-2 mb-4">
                {(ticket.messages || []).map(msg => (
                  <div key={msg.id} className={`p-3 rounded-lg text-sm ${
                    (msg as any).sender?.role === 'admin' ? 'bg-indigo-50 dark:bg-indigo-900/20 ml-8' : 'bg-gray-50 dark:bg-slate-900/50 mr-8'
                  }`}>
                    <p className="font-medium text-gray-900 dark:text-white text-xs mb-1">{(msg as any).sender?.full_name}</p>
                    <p className="text-gray-600 dark:text-gray-300">{msg.message}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input placeholder={t('typeReply')} value={replyText[ticket.id] || ''}
                  onChange={e => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply(ticket.id)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white" />
                <button onClick={() => handleReply(ticket.id)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {tickets.length === 0 && (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">{t('noTickets')}</div>
      )}
    </div>
  );
};
