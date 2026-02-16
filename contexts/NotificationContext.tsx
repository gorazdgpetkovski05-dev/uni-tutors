import React, { createContext, useContext, useState, useCallback } from 'react';
import { Notification } from '../types';
import { Trophy, CheckCircle, Info, X } from 'lucide-react';

interface NotificationContextType {
  notify: (title: string, message: string, type?: Notification['type']) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notify: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((title: string, message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3">
        {notifications.map(n => (
          <div 
            key={n.id} 
            className={`
              min-w-[300px] p-4 rounded-xl shadow-2xl border border-white/20 text-white flex items-start gap-3 animate-slide-in
              ${n.type === 'achievement' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                n.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                'bg-slate-800'}
            `}
          >
            <div className="mt-1">
              {n.type === 'achievement' && <Trophy className="h-6 w-6 text-yellow-100" />}
              {n.type === 'success' && <CheckCircle className="h-6 w-6 text-green-100" />}
              {n.type === 'info' && <Info className="h-6 w-6 text-blue-100" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">{n.title}</h4>
              <p className="text-xs text-white/90 mt-1">{n.message}</p>
            </div>
            <button onClick={() => removeNotification(n.id)} className="text-white/50 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
