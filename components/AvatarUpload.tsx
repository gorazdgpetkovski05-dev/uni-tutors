import React, { useState, useRef, useCallback } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface AvatarUploadProps {
  currentUrl: string;
  userId: string;
  onUploaded: (url: string) => void;
  size?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentUrl, userId, onUploaded, size = 'w-20 h-20' }) => {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) { alert(t('fileTooLarge')); return; }

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `avatars/${userId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });

    if (error) {
      // Storage bucket might not exist — fall back to base64 data URL
      if (import.meta.env.DEV) console.error('Upload error:', error.message);
      // Convert to base64 as fallback
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onUploaded(dataUrl);
        setUploading(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    onUploaded(publicUrl);
    setUploading(false);
  }, [userId, onUploaded, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const displayUrl = preview || currentUrl;

  return (
    <div className="flex items-center gap-4">
      <div
        className={`${size} rounded-full relative overflow-hidden ring-4 ${dragOver ? 'ring-indigo-400 scale-105' : 'ring-indigo-50 dark:ring-indigo-900/30'} transition-all cursor-pointer group`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <img src={displayUrl} alt="Avatar" className="w-full h-full object-cover" />
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${dragOver ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          {uploading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="h-5 w-5 text-white" />
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" aria-label="Upload avatar image" />
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p className="font-medium">{t('dragDropPhoto')}</p>
        <p>{t('maxFileSize')}</p>
      </div>
    </div>
  );
};
