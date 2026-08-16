import { createClient } from "@/lib/db/supabase/server";
import { MomentCard } from "@/components/moment/MomentCard";
import { Moment } from "@/features/moments/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { getBlockedUserIds } from "@/app/(product)/actions/moderation";

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ feed?: string }> }) {
  const supabase = await createClient();
  const { feed = 'global' } = await searchParams;
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch moments that are public and LIVE
  let query = supabase
    .from('moments')
    .select(`
      id,
      title,
      description,
      category,
      status,
      participant_count,
      likes_count,
      trending_score,
      created_at,
      posts (
        id,
        body,
        created_at,
        users:author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      )
    `)
    .eq('visibility', 'public')
    .eq('status', 'LIVE');

  if (feed === 'following') {
    if (!user) {
      // Return empty if not logged in but trying to view following
      query = query.in('creator_id', []); 
    } else {
      const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', user.id);
      const followingIds = follows ? follows.map(f => f.following_id) : [];
      if (followingIds.length > 0) {
        query = query.in('creator_id', followingIds);
      } else {
        query = query.in('creator_id', []); // Empty feed
      }
    }
  }

  // Filter out blocked users
  const blockedIds = await getBlockedUserIds();
  if (blockedIds.length > 0) {
    // Supabase JS doesn't have an exact `not.in` via standard chaining, 
    // we use a filter: `not(creator_id, 'in', (a,b,c))`
    const blockList = `(${blockedIds.join(',')})`;
    query = query.not('creator_id', 'in', blockList);
  }

  const { data: moments, error } = await query.order('trending_score', { ascending: false });

  // Map the Supabase data to our UI Moment type
  // Note: For Phase 1 we are faking the locationName and coordinates since Places aren't fully integrated yet.
  const mappedMoments: Moment[] = (moments || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    locationName: 'Local Area', // TODO: Fetch from Places
    coordinates: { lat: 0, lng: 0 },
    participantCount: m.participant_count,
    likesCount: m.likes_count || 0,
    category: m.category as any,
    isLive: m.status === 'LIVE',
    trendingScore: m.trending_score,
    createdAt: m.created_at,
    posts: (m.posts || []).map((p: any) => ({
      id: p.id,
      momentId: m.id,
      content: p.body,
      createdAt: p.created_at,
      author: {
        id: p.users?.id || 'unknown',
        username: p.users?.username || 'unknown',
        name: p.users?.display_name || 'Anonymous',
        avatarUrl: p.users?.avatar_url,
      }
    }))
  }));

  // Fetch unread notifications count
  let unreadCount = 0;
  if (user) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    unreadCount = count || 0;
  }

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Happening Now</h1>
            <Link href="/notifications" className="relative p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors mt-1">
              <Bell size={20} className="text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-background rounded-full"></span>
              )}
            </Link>
          </div>
          
          {/* Feed Toggle */}
          <div className="flex bg-white/5 border border-white/10 rounded-full p-1 relative w-full mb-2">
            <Link 
              href="/discover?feed=global"
              className={cn(
                "flex-1 text-center py-2 text-sm font-bold rounded-full transition-colors z-10",
                feed === 'global' ? "text-white" : "text-muted-foreground hover:text-white/80"
              )}
            >
              Global
            </Link>
            <Link 
              href="/discover?feed=following"
              className={cn(
                "flex-1 text-center py-2 text-sm font-bold rounded-full transition-colors z-10",
                feed === 'following' ? "text-white" : "text-muted-foreground hover:text-white/80"
              )}
            >
              Following
            </Link>
            
            {/* Animated Background Indicator */}
            <div 
              className={cn(
                "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-brand-500 rounded-full transition-transform duration-300 shadow-[0_0_15px_rgba(99,102,241,0.3)]",
                feed === 'following' ? "translate-x-[calc(100%+4px)]" : "translate-x-0"
              )}
            />
          </div>
        </header>

        <main className="flex-1 pb-24">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">
              Error loading moments: {error.message}
            </div>
          )}

          {mappedMoments.length === 0 && !error ? (
            <div className="text-center py-20 opacity-50 px-6">
              <p>{feed === 'following' ? "No moments from people you follow." : "No active moments nearby."}</p>
              <p className="text-sm mt-2">{feed === 'following' ? "Follow more people to see their moments here." : "Be the first to start one!"}</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {mappedMoments.map((moment) => (
                <MomentCard key={moment.id} moment={moment} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
