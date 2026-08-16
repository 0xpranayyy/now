import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import { updateProfile, forceCreateProfile } from "./actions";
import { signOut } from "@/app/login/actions";
import { LogOut, MapPin } from "lucide-react";
import { AvatarUpload } from "./AvatarUpload";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch follower stats
  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id)
  ]);

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // Edge case: User is authenticated but missing a profile record
    return (
      <div className="flex flex-col h-[100dvh] bg-background items-center justify-center p-6">
        <div className="glass-card p-8 rounded-3xl w-full max-w-sm relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500/20 rounded-full blur-3xl opacity-50" />
          
          <h1 className="text-2xl font-bold mb-2 relative z-10">Profile Missing</h1>
          <p className="text-muted-foreground text-sm mb-6 relative z-10">
            It looks like your profile didn't finish setting up. Let's fix that.
          </p>

          <form action={forceCreateProfile} className="flex flex-col gap-4 relative z-10 mb-6">
            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block pl-1">Username</label>
              <input 
                name="username" 
                type="text" 
                required
                placeholder="e.g. ghost_1"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground/80 mb-1 block pl-1">Display Name</label>
              <input 
                name="display_name" 
                type="text" 
                required
                placeholder="e.g. The Ghost"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
              />
            </div>
            <button 
              type="submit"
              className="mt-2 w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 rounded-xl transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              Complete Setup
            </button>
          </form>

          <div className="relative z-10 border-t border-white/10 pt-4 flex justify-center">
            <form action={signOut}>
              <button type="submit" className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                <LogOut size={14} />
                Sign out instead
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* Header Image Area */}
        <div className="h-32 bg-gradient-to-r from-brand-600 to-indigo-900 relative">
          <form action={signOut} className="absolute top-4 right-4">
            <button type="submit" className="w-10 h-10 bg-black/40 border border-white/10 rounded-full flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors backdrop-blur-md">
              <LogOut size={16} />
            </button>
          </form>
        </div>

        <div className="px-6 relative -mt-16 pb-20">
          <AvatarUpload 
            currentAvatarUrl={profile.avatar_url} 
            displayName={profile.display_name} 
          />

          <h1 className="text-2xl font-bold">{profile.display_name}</h1>
          <p className="text-muted-foreground text-sm mb-4">@{profile.username}</p>

          {/* Stats Row */}
          <div className="flex gap-6 mb-8">
            <div className="flex gap-1.5 items-baseline">
              <span className="font-bold text-lg">{followersCount || 0}</span>
              <span className="text-muted-foreground text-sm">Followers</span>
            </div>
            <div className="flex gap-1.5 items-baseline">
              <span className="font-bold text-lg">{followingCount || 0}</span>
              <span className="text-muted-foreground text-sm">Following</span>
            </div>
          </div>

          {/* Edit Form */}
          <div className="glass-card p-6 rounded-3xl">
            <h2 className="text-sm font-bold tracking-wider uppercase text-muted-foreground mb-4">Edit Profile</h2>
            
            <form action={updateProfile} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block pl-1">Display Name</label>
                <input 
                  name="display_name" 
                  type="text" 
                  defaultValue={profile.display_name}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 block pl-1">Bio</label>
                <textarea 
                  name="bio" 
                  defaultValue={profile.bio || ''}
                  rows={3}
                  placeholder="A little bit about you..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground/80 mb-1 flex items-center gap-1 pl-1">
                  <MapPin size={12} />
                  Home City
                </label>
                <input 
                  name="home_city" 
                  type="text" 
                  defaultValue={profile.home_city || ''}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-colors"
                />
              </div>

              <button 
                type="submit"
                className="mt-2 w-full bg-secondary hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
