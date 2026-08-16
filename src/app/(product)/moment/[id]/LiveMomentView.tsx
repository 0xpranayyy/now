"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, MapPin, Users, Flame, Send, Share2, Camera, X } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/db/supabase/client";
import { Moment, Post } from "@/features/moments/types";
import { createPost } from "./actions";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

interface LiveMomentViewProps {
  initialMoment: Moment;
  currentUserId?: string;
}

export function LiveMomentView({ initialMoment, currentUserId }: LiveMomentViewProps) {
  const [moment, setMoment] = useState<Moment>(initialMoment);
  const [liveCount, setLiveCount] = useState(initialMoment.participantCount);
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{id: string, emoji: string, left: number}[]>([]);
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  // Helper to trigger a floating emoji
  const spawnEmoji = (emoji: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const left = 20 + Math.random() * 60; // Random horizontal position (20% to 80%)
    setFloatingEmojis(prev => [...prev, { id, emoji, left }]);
    
    // Remove after animation (2.5s)
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2500);
  };

  useEffect(() => {
    // 1. Setup Channel
    const channel = supabase.channel(`moment:${moment.id}`);

    // 2. Listen to PostgreSQL changes on the posts table
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: `moment_id=eq.${moment.id}`,
      },
      async (payload) => {
        // Fetch author details since they aren't in the raw payload
        const { data: author } = await supabase
          .from('users')
          .select('id, username, display_name, avatar_url, is_verified')
          .eq('id', payload.new.author_id)
          .single();
          
        if (author) {
          const newPost: Post = {
            id: payload.new.id,
            momentId: moment.id,
            content: payload.new.body,
            mediaUrl: payload.new.media_url,
            createdAt: payload.new.created_at,
            author: {
              id: author.id,
              username: author.username,
              name: author.display_name,
              avatarUrl: author.avatar_url,
              isVerified: author.is_verified,
            }
          };

          setMoment(prev => ({
            ...prev,
            posts: [newPost, ...prev.posts]
          }));
        }
      }
    );

    // 3. Listen to Presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      // Calculate unique users
      const uniqueUsers = new Set();
      for (const id in state) {
        uniqueUsers.add(id); // Supabase presence state groups by key (we'll use user_id or random uuid)
      }
      // Add the real-time viewers to the base participant count
      setLiveCount(uniqueUsers.size);
    });

    // 4. Listen to Broadcast (Emoji Reactions)
    channel.on('broadcast', { event: 'reaction' }, (payload) => {
      if (payload.payload?.emoji) {
        spawnEmoji(payload.payload.emoji);
      }
    });

    // 5. Subscribe and track presence
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const presenceId = currentUserId || crypto.randomUUID();
        await channel.track({ user_id: presenceId, joined_at: new Date().toISOString() });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [moment.id, currentUserId, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedFile) || isSubmitting) return;

    const content = inputValue.trim();
    setInputValue("");
    setIsSubmitting(true);

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
        setSelectedFile(null); // Clear preview
      }

      await createPost(moment.id, content, mediaUrl);
    } catch (error: any) {
      alert(error.message || "Failed to post");
      setInputValue(content);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReaction(emoji: string) {
    if (!currentUserId) return;
    
    // Optimistic UI
    spawnEmoji(emoji);

    // Broadcast to others
    const channel = supabase.channel(`moment:${moment.id}`);
    await channel.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { emoji, userId: currentUserId },
    });
  }

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Header */}
      <header className="glass sticky top-0 z-20 px-4 py-4 flex items-center gap-4">
        <Link href="/discover" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="font-bold text-lg leading-tight truncate">{moment.title}</h1>
          <div className="flex items-center text-xs text-muted-foreground gap-1">
            <MapPin size={12} />
            <span className="truncate">{moment.locationName}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {moment.isLive && (
            <div className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2 py-1 rounded-full text-[10px] font-bold tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse-slow" />
              LIVE
            </div>
          )}
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: moment.title,
                  text: `Check out this moment on NOW: ${moment.title}`,
                  url: window.location.href,
                }).catch(console.error);
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/15 transition-colors"
          >
            <Share2 size={14} />
          </motion.button>
        </div>
      </header>

      {/* Info Section */}
      <div className="px-6 py-6 border-b border-white/5 shrink-0">
        {moment.description && (
          <p className="text-foreground/90 mb-6">{moment.description}</p>
        )}
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <div className="font-bold text-lg leading-none">{liveCount > 0 ? liveCount : moment.participantCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Here now</div>
            </div>
          </div>
          {moment.trendingScore > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Flame size={20} />
              </div>
              <div>
                <div className="font-bold text-lg leading-none">{moment.trendingScore}</div>
                <div className="text-xs text-muted-foreground mt-1">Trending</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col-reverse" ref={feedRef}>
        {moment.posts.length === 0 ? (
          <div className="text-center text-muted-foreground py-10 h-full flex items-center justify-center">No messages yet. Be the first!</div>
        ) : (
          moment.posts.map((post) => (
            <div key={post.id} className="flex gap-3 animate-slide-up">
              <Link href={`/profile/${post.author.id}`} className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0 block hover:opacity-80 transition-opacity">
                {post.author.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.author.avatarUrl} alt={post.author.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm font-bold">
                    {post.author.name.charAt(0)}
                  </div>
                )}
              </Link>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <Link href={`/profile/${post.author.id}`} className="font-bold text-sm hover:underline hover:text-brand-400 transition-colors flex items-center gap-1">
                    {post.author.name}
                    {post.author.isVerified && <VerifiedBadge size={14} />}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="bg-secondary/50 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex flex-col gap-2">
                  {post.mediaUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.mediaUrl} alt="Attached media" className="rounded-lg max-w-[200px] sm:max-w-xs object-contain bg-black/20" />
                  )}
                  {post.content && <span>{post.content}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Emojis Container */}
      <div className="fixed bottom-24 left-0 right-0 pointer-events-none z-50 h-64 overflow-hidden">
        {floatingEmojis.map((item) => (
          <div 
            key={item.id} 
            className="absolute bottom-0 text-3xl animate-float-up opacity-0"
            style={{ left: `${item.left}%` }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 glass border-t border-white/10 pb-safe shrink-0 flex flex-col gap-3">
        {/* Reaction Bar */}
        <div className="flex gap-2">
          {['🔥', '❤️', '💯', '😂', '👀'].map((emoji) => (
            <motion.button
              whileTap={{ scale: 0.85 }}
              key={emoji}
              onClick={() => handleReaction(emoji)}
              disabled={!currentUserId}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              {emoji}
            </motion.button>
          ))}
        </div>

        {/* Selected File Preview */}
        {selectedFile && (
          <div className="relative inline-block mt-2">
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

        <form className="flex gap-2 relative" onSubmit={handleSubmit}>
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
            disabled={isSubmitting || !currentUserId}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0 disabled:opacity-50"
          >
            <Camera size={20} className="text-muted-foreground" />
          </button>

          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSubmitting || !currentUserId}
            placeholder={currentUserId ? "Say something..." : "Log in to post..."}
            className="flex-1 bg-black/40 border border-white/10 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-colors disabled:opacity-50"
          />
          <motion.button 
            whileTap={{ scale: 0.9 }}
            type="submit" 
            disabled={isSubmitting || !currentUserId || (!inputValue.trim() && !selectedFile)}
            className="w-12 h-12 bg-brand-500 rounded-full flex items-center justify-center text-white hover:bg-brand-600 transition-colors shrink-0 disabled:opacity-50 shadow-sm"
          >
            <Send size={18} className="ml-0.5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
