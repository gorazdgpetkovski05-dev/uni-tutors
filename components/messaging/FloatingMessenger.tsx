import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, ChevronLeft, ArrowUp, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { DirectMessage } from '../../types';

interface Conversation {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export const FloatingMessenger: React.FC = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [activeUserName, setActiveUserName] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [totalUnread, setTotalUnread] = useState(0);
  const [allContacts, setAllContacts] = useState<{ id: string; full_name: string; avatar_url: string | null }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isStudent = profile?.role === 'student';

  const loadConversations = useCallback(async () => {
    if (!user) return;
    // 1. Get all DMs involving current user
    const { data: dms } = await supabase.from('direct_messages')
      .select('sender_id, receiver_id, content, created_at, read')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    // 2. Get course contacts
    let contactIds = new Set<string>();
    if (isStudent) {
      const { data: enrollments } = await supabase.from('enrollments')
        .select('course_id, course:courses(professor_id)').eq('student_id', user.id).in('status', ['approved', 'completed']);
      (enrollments || []).forEach((e: any) => { if (e.course?.professor_id) contactIds.add(e.course.professor_id); });
      // Also get fellow students from same courses
      const courseIds = (enrollments || []).map((e: any) => e.course_id).filter(Boolean);
      if (courseIds.length > 0) {
        const { data: fellows } = await supabase.from('enrollments')
          .select('student_id').in('course_id', courseIds).in('status', ['approved', 'completed']).neq('student_id', user.id);
        (fellows || []).forEach((f: any) => contactIds.add(f.student_id));
      }
    } else {
      const { data: courses } = await supabase.from('courses').select('id').eq('professor_id', user.id);
      if (courses && courses.length > 0) {
        const { data: enrollments } = await supabase.from('enrollments')
          .select('student_id').in('course_id', courses.map((c: any) => c.id)).in('status', ['approved', 'completed']);
        (enrollments || []).forEach((e: any) => contactIds.add(e.student_id));
      }
    }

    // 3. Build DM-based conversations
    const dmMap = new Map<string, { lastMessage: string; lastMessageAt: string; unreadCount: number }>();
    (dms || []).forEach(dm => {
      const otherId = dm.sender_id === user.id ? dm.receiver_id : dm.sender_id;
      contactIds.add(otherId);
      if (!dmMap.has(otherId)) {
        dmMap.set(otherId, { lastMessage: dm.content, lastMessageAt: dm.created_at, unreadCount: 0 });
      }
      if (dm.receiver_id === user.id && !dm.read) {
        const entry = dmMap.get(otherId)!;
        entry.unreadCount++;
      }
    });

    // 4. Fetch profiles for all contact IDs
    const allIds = [...contactIds].filter(id => id !== user.id);
    if (allIds.length === 0) { setConversations([]); setAllContacts([]); setTotalUnread(0); return; }
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, avatar_url').in('id', allIds);
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));
    setAllContacts(profiles || []);

    // 5. Build conversation list: messaged users first, then contacts without messages
    const convos: Conversation[] = [];
    const added = new Set<string>();

    // Users with existing DMs (sorted by last message time)
    const dmEntries = [...dmMap.entries()].sort((a, b) => new Date(b[1].lastMessageAt).getTime() - new Date(a[1].lastMessageAt).getTime());
    for (const [otherId, info] of dmEntries) {
      const p = profileMap.get(otherId);
      if (!p) continue;
      convos.push({ otherUserId: otherId, otherUserName: p.full_name, otherUserAvatar: p.avatar_url, ...info });
      added.add(otherId);
    }
    // Contacts without messages
    for (const id of allIds) {
      if (added.has(id)) continue;
      const p = profileMap.get(id);
      if (!p) continue;
      convos.push({ otherUserId: id, otherUserName: p.full_name, otherUserAvatar: p.avatar_url, lastMessage: '', lastMessageAt: '', unreadCount: 0 });
    }

    setConversations(convos);
    setTotalUnread(convos.reduce((s, c) => s + c.unreadCount, 0));
  }, [user, isStudent]);

  useEffect(() => { if (user && open) loadConversations(); }, [user, open, loadConversations]);

  useEffect(() => {
    if (!user || open) return;
    const fetchUnread = async () => {
      const { count } = await supabase.from('direct_messages').select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id).eq('read', false);
      setTotalUnread(count || 0);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user, open]);

  useEffect(() => {
    if (!activeUserId || !user) return;
    const load = async () => {
      const { data } = await supabase.from('direct_messages').select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeUserId}),and(sender_id.eq.${activeUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
      await supabase.from('direct_messages').update({ read: true })
        .eq('receiver_id', user.id).eq('sender_id', activeUserId).eq('read', false);
    };
    load();
    const channel = supabase.channel(`dm:${[user.id, activeUserId].sort().join('-')}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' },
        (payload) => {
          const msg = payload.new as DirectMessage;
          if ((msg.sender_id === user.id && msg.receiver_id === activeUserId) ||
              (msg.sender_id === activeUserId && msg.receiver_id === user.id)) {
            setMessages(prev => [...prev, msg]);
            if (msg.sender_id !== user.id) supabase.from('direct_messages').update({ read: true }).eq('id', msg.id).then();
          }
        }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeUserId, user]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim().slice(0, 2000);
    if (!content || sending || !activeUserId || !user) return;
    setSending(true); setNewMessage('');
    await supabase.from('direct_messages').insert({ sender_id: user.id, receiver_id: activeUserId, content });
    setSending(false);
  };

  const openChat = (userId: string, userName: string) => {
    setActiveUserId(userId); setActiveUserName(userName); setMessages([]);
  };

  // Live search ALL users on the platform by name
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .ilike('full_name', `%${q}%`)
        .neq('id', user?.id || '')
        .limit(10);
      const existing = new Set(conversations.map(c => c.otherUserId));
      const results = (data || [])
        .filter(p => !existing.has(p.id))
        .map(p => ({ otherUserId: p.id, otherUserName: p.full_name, otherUserAvatar: p.avatar_url, lastMessage: '', lastMessageAt: '', unreadCount: 0 }));
      setSearchResults(results);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, user, conversations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    const matchedConvos = conversations.filter(c => c.otherUserName.toLowerCase().includes(q));
    return [...matchedConvos, ...searchResults];
  }, [search, conversations, searchResults]);

  const grouped = useMemo(() => {
    if (!messages.length) return [];
    const groups: { senderId: string; msgs: DirectMessage[] }[] = [];
    messages.forEach(m => {
      const last = groups[groups.length - 1];
      if (last && last.senderId === m.sender_id) last.msgs.push(m);
      else groups.push({ senderId: m.sender_id, msgs: [m] });
    });
    return groups;
  }, [messages]);

  if (!user) return null;

  return (
    <>
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-24 md:bottom-8 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 hover:shadow-xl"
        style={{ marginBottom: '0px', marginRight: '0px' }}>
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-40 md:bottom-24 right-4 z-50 w-[350px] h-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200/60 dark:border-slate-700/60 flex flex-col overflow-hidden">

            {!activeUserId ? (
              <>
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
                  <div className="w-8" />
                  <h3 className="font-bold text-[17px] text-gray-900 dark:text-white">{t('messenger')}</h3>
                  <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
                <div className="px-3 py-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchConversations')}
                      className="w-full pl-9 pr-3 py-[7px] text-sm rounded-full bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border-0" />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <MessageCircle className="h-10 w-10 text-gray-300 dark:text-slate-600 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('noConversations')}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('startChat')}</p>
                    </div>
                  ) : filtered.map((c, i) => (
                    <button key={c.otherUserId} onClick={() => openChat(c.otherUserId, c.otherUserName)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors text-left">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-base shrink-0">
                        {c.otherUserName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[15px] text-gray-900 dark:text-white truncate">{c.otherUserName}</p>
                          {c.lastMessageAt && <span className="text-[11px] text-gray-400 shrink-0 ml-2">
                            {new Date(c.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>}
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-[13px] text-gray-500 dark:text-gray-400 truncate">{c.lastMessage || ''}</p>
                          {c.unreadCount > 0 && <span className="w-[10px] h-[10px] bg-blue-500 rounded-full shrink-0 ml-2" />}
                        </div>
                      </div>
                      {i < filtered.length - 1 && <div className="absolute bottom-0 left-[76px] right-4 h-px bg-gray-100 dark:bg-slate-800" />}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-100 dark:border-slate-800 backdrop-blur-sm">
                  <button onClick={() => { setActiveUserId(null); loadConversations(); }} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-blue-500">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <h3 className="font-semibold text-[15px] text-gray-900 dark:text-white truncate flex-1 text-center">{activeUserName}</h3>
                  <button onClick={() => { setOpen(false); setActiveUserId(null); }} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-3">
                  {grouped.map((group, gi) => {
                    const isOwn = group.senderId === user.id;
                    return (
                      <div key={gi} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${gi > 0 ? 'mt-3' : ''}`}>
                        {group.msgs.map((msg, mi) => (
                          <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                            className={`max-w-[70%] px-4 py-2 text-[15px] leading-snug shadow-sm ${mi > 0 ? 'mt-[3px]' : ''} ${
                              isOwn
                                ? `bg-gradient-to-br from-blue-500 to-blue-600 text-white ${mi === group.msgs.length - 1 ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl'}`
                                : `bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white ${mi === group.msgs.length - 1 ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl'}`
                            }`}>
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </motion.div>
                        ))}
                        <p className="text-[10px] text-gray-400 mt-1 px-1">
                          {new Date(group.msgs[group.msgs.length - 1].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={handleSend} className="px-3 py-2 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2">
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)} maxLength={2000}
                    placeholder={t('typeMessage')}
                    className="flex-1 px-4 py-[7px] text-[15px] rounded-full bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none border-0" />
                  <AnimatePresence>
                    {newMessage.trim() && (
                      <motion.button type="submit" disabled={sending} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 400 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50">
                        <ArrowUp className="h-4 w-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
