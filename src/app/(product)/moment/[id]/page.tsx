import { notFound } from "next/navigation";
import { createClient } from "@/lib/db/supabase/server";
import { Moment } from "@/features/moments/types";
import { LiveMomentView } from "./LiveMomentView";

export default async function MomentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: m, error }, { data: { user } }] = await Promise.all([
    supabase
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
      .eq('id', id)
      .single(),
    supabase.auth.getUser()
  ]);

  if (error || !m) {
    notFound();
  }

  // Map data to our UI type
  const moment: Moment = {
    id: m.id,
    title: m.title,
    description: m.description || undefined,
    locationName: 'Local Area', // TODO: Implement real places
    coordinates: { lat: 0, lng: 0 },
    participantCount: m.participant_count,
    likesCount: m.likes_count || 0,
    category: m.category as any,
    isLive: m.status === 'LIVE',
    trendingScore: m.trending_score,
    createdAt: m.created_at,
    posts: (m.posts || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((p: any) => ({
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
  };

  return <LiveMomentView initialMoment={moment} currentUserId={user?.id} />;
}
