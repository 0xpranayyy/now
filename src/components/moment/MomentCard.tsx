import Link from "next/link";
import { MapPin, Users, Flame, Clock } from "lucide-react";
import { Moment } from "@/features/moments/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { LikeButton } from "./LikeButton";

interface MomentCardProps {
  moment: Moment;
}

export function MomentCard({ moment }: MomentCardProps) {
  return (
    <Link href={`/moment/${moment.id}`} className="block border-b border-white/5 last:border-0 relative">
      <div className="p-6 relative overflow-hidden group hover:bg-white/[0.02] transition-colors">
        
        {/* Dynamic Category Background Glow */}
        <div className={cn(
          "absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-[0.07] group-hover:opacity-15 transition-opacity duration-500",
          moment.category === 'nightlife' ? 'bg-purple-500' :
          moment.category === 'food' ? 'bg-orange-500' :
          moment.category === 'event' ? 'bg-brand-500' :
          moment.category === 'sports' ? 'bg-green-500' : 'bg-blue-500'
        )} />
        
        <div className="flex justify-between items-start mb-3 relative z-10">
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-1.5">{moment.title}</h3>
            <div className="flex items-center gap-3 text-muted-foreground text-sm font-medium">
              <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                <span>{moment.locationName}</span>
              </div>
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                <span>{formatDistanceToNow(new Date(moment.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          {moment.isLive && (
            <div className="flex items-center gap-1.5 bg-brand-500/10 text-brand-400 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase border border-brand-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
              LIVE
            </div>
          )}
        </div>
        
        {moment.description && (
          <p className="text-foreground/80 mb-6 leading-relaxed relative z-10">
            {moment.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2 relative z-10">
          <div className="flex items-center gap-3">
            <LikeButton momentId={moment.id} initialLikes={moment.likesCount || 0} />
            
            <div className="flex items-center gap-1.5 text-brand-300 bg-brand-500/10 px-3 py-1.5 rounded-full border border-brand-500/20">
              <Users size={16} />
              <span className="font-medium text-sm">{moment.participantCount}</span>
            </div>
            {moment.trendingScore > 80 && (
              <div className="flex items-center gap-1 text-orange-400">
                <Flame size={16} />
                <span className="font-medium">Trending</span>
              </div>
            )}
          </div>
          
          {moment.posts.length > 0 && (
            <div className="flex -space-x-2">
              {moment.posts.slice(0, 3).map((post, i) => (
                <div 
                  key={post.id} 
                  className={cn(
                    "w-7 h-7 rounded-full border-2 border-[#18181b] bg-secondary flex items-center justify-center overflow-hidden",
                    `z-[${3-i}]`
                  )}
                >
                  {post.author.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.author.avatarUrl} alt={post.author.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-medium">{post.author.name.charAt(0)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
