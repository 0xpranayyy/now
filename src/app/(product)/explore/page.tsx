import { createClient } from "@/lib/db/supabase/server";
import { MomentCard } from "@/components/moment/MomentCard";
import { Moment } from "@/features/moments/types";

// Revalidate every minute
export const revalidate = 60;

export default async function ExplorePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch globally trending moments
  // We ignore distance and purely order by trending_score
  const { data, error } = await supabase
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
      location_point,
      posts (
        id,
        body,
        created_at,
        users:author_id (
          id,
          username,
          display_name,
          avatar_url,
          is_verified
        )
      )
    `)
    .eq('status', 'LIVE')
    .order('trending_score', { ascending: false })
    .order('participant_count', { ascending: false })
    .limit(30);

  if (error) {
    console.error("Error fetching explore moments:", error);
  }

  const moments: Moment[] = (data || []).map(m => {
    // Parse GeoJSON coordinates
    let lat = 0;
    let lng = 0;
    if (m.location_point && m.location_point.coordinates) {
      lng = m.location_point.coordinates[0];
      lat = m.location_point.coordinates[1];
    }

    return {
      id: m.id,
      title: m.title,
      description: m.description || undefined,
      locationName: 'Global', // Obfuscate exact location name or fetch reverse geocode if needed
      coordinates: { lat, lng },
      participantCount: m.participant_count,
      likesCount: m.likes_count || 0,
      category: m.category as any,
      isLive: m.status === 'LIVE',
      trendingScore: m.trending_score,
      createdAt: m.created_at,
      posts: (m.posts || [])
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((p: any) => ({
          id: p.id,
          momentId: m.id,
          content: p.body,
          createdAt: p.created_at,
          author: {
            id: p.users?.id || 'unknown',
            username: p.users?.username || 'unknown',
            name: p.users?.display_name || 'Anonymous',
            avatarUrl: p.users?.avatar_url,
            isVerified: p.users?.is_verified || false,
          }
        }))
    };
  });

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" />
      </div>

      {/* Header */}
      <header className="glass sticky top-0 z-20 px-4 py-6">
        <h1 className="text-3xl font-black tracking-tight mb-2">Explore</h1>
        <p className="text-muted-foreground">Trending across the network.</p>
      </header>

      {/* Main Feed */}
      <div className="flex-1 overflow-y-auto pb-safe-offset z-10 px-4">
        {moments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p>No active moments found globally.</p>
            <p className="text-sm mt-2">Why not start one?</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {moments.map((moment) => (
              <MomentCard key={moment.id} moment={moment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
