'use client';

import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { followUser, unfollowUser } from './actions';
import { cn } from '@/lib/utils';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  currentUserId?: string;
}

export function FollowButton({ targetUserId, initialIsFollowing, currentUserId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  // Hide button if looking at your own profile
  if (currentUserId === targetUserId) return null;

  const handleToggle = () => {
    if (!currentUserId) {
      alert("Please log in to follow users.");
      return;
    }

    // Optimistic UI update
    const previousState = isFollowing;
    setIsFollowing(!previousState);

    startTransition(async () => {
      try {
        if (previousState) {
          await unfollowUser(targetUserId);
        } else {
          await followUser(targetUserId);
        }
      } catch (error) {
        // Revert on error
        setIsFollowing(previousState);
        alert("Action failed. Please try again.");
      }
    });
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 px-6 py-2.5 rounded-full font-bold transition-all border shadow-lg",
        isFollowing 
          ? "bg-white/5 border-white/10 text-white hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20" 
          : "bg-brand-500 border-brand-400 text-white hover:bg-brand-600 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
      )}
    >
      {isPending ? (
        <Loader2 size={18} className="animate-spin" />
      ) : isFollowing ? (
        <UserMinus size={18} />
      ) : (
        <UserPlus size={18} />
      )}
      {isFollowing ? "Following" : "Follow"}
    </motion.button>
  );
}
