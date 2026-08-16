'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/db/supabase/client';
import { sendDirectMessage } from '../actions';
import { ChevronLeft, Send, User, Camera, X } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

interface LiveDMViewProps {
  conversationId: string;
  currentUserId: string;
  otherUser: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string | null;
    is_verified?: boolean;
  };
  initialMessages: any[];
}

export function LiveDMView({ conversationId, currentUserId, otherUser, initialMessages }: LiveDMViewProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel(`dm_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => {
          // Prevent duplicates if we already optimistically added it
          if (prev.some(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || isSending) return;

    const messageText = inputValue.trim();
    setInputValue('');
    setIsSending(true);

    try {
      let mediaUrl = undefined;
      
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${currentUserId}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(fileName, selectedFile);
          
        if (uploadError) throw new Error(uploadError.message);
        
        mediaUrl = supabase.storage.from('media').getPublicUrl(fileName).data.publicUrl;
        setSelectedFile(null);
      }

      // Optimistic insert
      const tempId = crypto.randomUUID();
      const optimisticMsg = {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        body: messageText,
        media_url: mediaUrl,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, optimisticMsg]);

      await sendDirectMessage(conversationId, messageText, mediaUrl);
    } catch (error) {
      alert("Failed to send message");
      // Could remove the optimistic message here by tracking its temp ID more robustly
      setInputValue(messageText);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-20 px-4 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          
          <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
              {otherUser.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <User size={18} />
                </div>
              )}
            </div>
            <div>
              <h1 className="font-bold text-sm leading-tight flex items-center gap-1">
                {otherUser.display_name}
                {otherUser.is_verified && <VerifiedBadge size={14} />}
              </h1>
              <p className="text-xs text-muted-foreground">@{otherUser.username}</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <p>Say hello to {otherUser.display_name}!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === currentUserId;
            // Simple logic to hide avatar if consecutive messages from same user
            const isConsecutive = index > 0 && messages[index - 1].sender_id === msg.sender_id;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto",
                  isConsecutive ? "mt-[-8px]" : "mt-2"
                )}
              >
                {!isMe && !isConsecutive && (
                  <div className="w-8 h-8 rounded-full bg-secondary overflow-hidden shrink-0 mt-auto">
                    {otherUser.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={otherUser.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                )}
                {/* Spacer for consecutive messages from the other user to align text */}
                {!isMe && isConsecutive && <div className="w-8 shrink-0" />}

                <div 
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm flex flex-col gap-2",
                    isMe 
                      ? "bg-brand-500 text-white rounded-br-sm shadow-sm" 
                      : "bg-white/10 text-foreground rounded-bl-sm"
                  )}
                >
                  {msg.media_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={msg.media_url} alt="Attached media" className="rounded-lg max-w-[200px] sm:max-w-xs object-contain bg-black/20" />
                  )}
                  {msg.body && <span>{msg.body}</span>}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 glass border-t border-white/5 pb-safe-offset flex flex-col gap-2">
        {/* Selected File Preview */}
        {selectedFile && (
          <div className="relative inline-block px-1">
            <div className="relative rounded-lg overflow-hidden border border-white/20 inline-flex max-w-[150px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-auto object-cover max-h-32" />
              <button 
                type="button"
                onClick={() => setSelectedFile(null)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <form 
          onSubmit={handleSend}
          className="flex items-center gap-2"
        >
          {/* Hidden File Input */}
          <input 
            type="file" 
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedFile(e.target.files[0]);
              }
            }}
            className="hidden" 
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 disabled:opacity-50"
          >
            <Camera size={18} className="text-muted-foreground" />
          </button>

          <div className="flex-1 flex items-center gap-2 bg-black/40 border border-white/10 rounded-full pl-4 pr-1 py-1">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-transparent border-none focus:outline-none text-sm py-2"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="submit"
              disabled={isSending || (!inputValue.trim() && !selectedFile)}
              className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-white/10 transition-colors shrink-0 shadow-sm"
            >
              <Send size={16} className="ml-[-2px] mt-[2px]" />
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}
