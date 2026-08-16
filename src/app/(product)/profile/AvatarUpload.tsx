'use client';

import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { uploadAvatar } from './actions';

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  displayName: string;
}

export function AvatarUpload({ currentAvatarUrl, displayName }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await uploadAvatar(formData);
    } catch (error) {
      console.error("Failed to upload avatar", error);
      alert("Failed to upload avatar. Make sure you ran the storage.sql script in your Supabase dashboard!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer w-24 h-24 rounded-full border-4 border-background bg-secondary flex items-center justify-center shadow-xl overflow-hidden mb-4 transition-transform active:scale-95">
      {isUploading ? (
        <Loader2 className="animate-spin text-brand-400" size={32} />
      ) : currentAvatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentAvatarUrl} alt={displayName} className="w-full h-full object-cover" />
      ) : (
        <div className="text-3xl font-bold text-muted-foreground">{displayName.charAt(0)}</div>
      )}

      {/* Overlay */}
      {!isUploading && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="text-white" size={24} />
        </div>
      )}

      {/* Hidden input */}
      <input 
        type="file" 
        accept="image/png, image/jpeg, image/webp" 
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}
