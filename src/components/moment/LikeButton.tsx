'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toggleLikeMoment } from './actions';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  momentId: string;
  initialLikes: number;
}

export function LikeButton({ momentId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to moment detail
    
    // Optimistic UI update
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

    startTransition(async () => {
      try {
        await toggleLikeMoment(momentId, !isLiked);
      } catch (error) {
        // Revert on error
        setIsLiked(isLiked);
        setLikes(initialLikes);
      }
    });
  };

  return (
    <motion.button 
      onClick={handleLike}
      whileTap={{ scale: 0.85 }}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors backdrop-blur-md border",
        isLiked 
          ? "bg-rose-500/20 text-rose-500 border-rose-500/30" 
          : "bg-black/30 text-white/70 border-white/10 hover:bg-black/50"
      )}
    >
      <Heart size={16} className={cn(isLiked && "fill-current")} />
      <span className="text-sm font-medium">{likes}</span>
    </motion.button>
  );
}
