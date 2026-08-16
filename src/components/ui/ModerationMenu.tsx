'use client';

import { useState } from 'react';
import { MoreHorizontal, ShieldAlert, Ban } from 'lucide-react';
import { blockUser, reportContent } from '@/app/(product)/actions/moderation';
import { motion, AnimatePresence } from 'framer-motion';

export function ModerationMenu({ targetUserId, targetType }: { targetUserId: string, targetType: 'user' | 'moment' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const handleBlock = async () => {
    if (confirm("Are you sure you want to block this user? You won't see their moments or messages anymore.")) {
      setIsBlocking(true);
      try {
        await blockUser(targetUserId);
        alert("User blocked successfully.");
      } catch (err) {
        alert("Failed to block user.");
      }
      setIsBlocking(false);
      setIsOpen(false);
    }
  };

  const handleReport = async () => {
    const reason = prompt("Why are you reporting this?");
    if (reason) {
      setIsReporting(true);
      try {
        await reportContent(targetType, targetUserId, reason);
        alert("Report submitted successfully. Our team will review it.");
      } catch (err) {
        alert("Failed to submit report.");
      }
      setIsReporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
      >
        <MoreHorizontal size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-12 w-48 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <button 
                onClick={handleReport}
                disabled={isReporting}
                className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <ShieldAlert size={16} className="text-yellow-500" />
                Report {targetType === 'user' ? 'Account' : 'Moment'}
              </button>
              <div className="h-px bg-white/5 w-full" />
              <button 
                onClick={handleBlock}
                disabled={isBlocking}
                className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-white/5 transition-colors text-red-500 disabled:opacity-50"
              >
                <Ban size={16} />
                Block User
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
