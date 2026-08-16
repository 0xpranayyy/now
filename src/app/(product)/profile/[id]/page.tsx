import { createClient } from "@/lib/db/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, User as UserIcon, MapPin, Calendar, MessageCircle } from "lucide-react";
import { FollowButton } from "./FollowButton";
import { getOrCreateConversation } from "@/app/(product)/messages/actions";
import { ModerationMenu } from "@/components/ui/ModerationMenu";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (!profile) {
    return (
      <div className="flex flex-col h-[100dvh] bg-background">
        <header className="glass sticky top-0 z-20 px-4 py-4 flex items-center gap-4 border-b border-white/5">
          <Link href="/discover" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-lg leading-tight">Profile Not Found</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground mb-6">
            <UserIcon size={48} className="opacity-50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-8">This profile may have been deleted or never existed.</p>
          <Link 
            href="/discover"
            className="bg-white text-black hover:bg-white/90 font-bold px-8 py-3 rounded-full transition-colors"
          >
            Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch follower stats
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', id)
  ]);

  let isFollowing = false;
  if (user && user.id !== id) {
    const { data } = await supabase
      .from('follows')
      .select('created_at')
      .match({ follower_id: user.id, following_id: id })
      .maybeSingle();
    
    if (data) isFollowing = true;
  }

  // Format joined date
  const joinedDate = new Date(profile.created_at).toLocaleDateString(undefined, { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <header className="glass sticky top-0 z-20 px-4 py-4 flex items-center gap-4 border-b border-white/5">
          {/* We use next/navigation router.back() client-side ideally, but a back link works for now */}
          <Link href="/discover" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-bold text-lg leading-tight">Profile</h1>
        </header>

        {/* Cover Area */}
        <div className="h-32 bg-gradient-to-b from-brand-500/10 to-transparent relative" />

        <div className="px-6 relative -mt-12 pb-20">
          {/* Avatar and Follow Button Row */}
          <div className="flex justify-between items-end mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-background bg-secondary flex items-center justify-center shadow-xl overflow-hidden">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={profile.display_name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={32} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex gap-2">
              {user && user.id !== profile.id && (
                <form action={getOrCreateConversation.bind(null, profile.id)}>
                  <button type="submit" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <MessageCircle size={18} />
                  </button>
                </form>
              )}
              <FollowButton 
                targetUserId={profile.id} 
                initialIsFollowing={isFollowing} 
                currentUserId={user?.id} 
              />
              {user && user.id !== profile.id && (
                <ModerationMenu targetUserId={profile.id} targetType="user" />
              )}
            </div>
          </div>

          <h1 className="text-2xl font-bold">{profile.display_name}</h1>
          <p className="text-brand-400 font-medium text-sm mb-4">@{profile.username}</p>

          {/* Stats Row */}
          <div className="flex gap-6 mb-6">
            <div className="flex gap-1.5 items-baseline">
              <span className="font-bold text-lg">{followersCount || 0}</span>
              <span className="text-muted-foreground text-sm">Followers</span>
            </div>
            <div className="flex gap-1.5 items-baseline">
              <span className="font-bold text-lg">{followingCount || 0}</span>
              <span className="text-muted-foreground text-sm">Following</span>
            </div>
          </div>

          {/* Info Card */}
          <div className="glass-card p-6 rounded-3xl flex flex-col gap-5">
            {profile.bio ? (
              <div>
                <h2 className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-2">About</h2>
                <p className="text-sm leading-relaxed text-foreground/90">{profile.bio}</p>
              </div>
            ) : (
              <p className="text-sm italic text-muted-foreground opacity-70">No bio provided.</p>
            )}

            <div className="h-px w-full bg-white/5" />

            <div className="flex flex-col gap-3">
              {profile.home_city && (
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span>{profile.home_city}</span>
                </div>
              )}
              
              <div className="flex items-center gap-3 text-sm text-foreground/80">
                <Calendar size={16} className="text-muted-foreground" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
