import { createClient } from "@/lib/db/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, UserPlus, Heart, ChevronLeft, User as UserIcon } from "lucide-react";
import { markNotificationsAsRead } from "./actions";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select(`
      id,
      type,
      is_read,
      created_at,
      actor_id,
      users:actor_id ( id, username, display_name, avatar_url )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  // Mark as read asynchronously after rendering
  markNotificationsAsRead();

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <header className="glass sticky top-0 z-20 px-4 py-4 flex items-center gap-4 border-b border-white/5">
        <Link href="/discover" className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg leading-tight">Notifications</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 px-6 text-center">
            <Bell size={48} className="mb-4 text-muted-foreground" />
            <p>You're all caught up!</p>
            <p className="text-sm mt-1">When someone interacts with you, it will appear here.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-white/5">
            {notifications.map((notif: any) => {
              const actor = notif.users;
              let Icon = Bell;
              let text = "interacted with you";
              let href = "#";
              let iconColor = "text-foreground";

              if (notif.type === 'follow') {
                Icon = UserPlus;
                text = "started following you";
                href = `/profile/${actor.id}`;
                iconColor = "text-blue-400";
              } else if (notif.type === 'like') {
                Icon = Heart;
                text = "liked your moment";
                iconColor = "text-red-500";
              }

              return (
                <Link 
                  key={notif.id}
                  href={href}
                  className={`flex gap-4 p-4 transition-colors hover:bg-white/5 ${notif.is_read ? 'opacity-70' : 'bg-brand-500/5'}`}
                >
                  <div className={`mt-1 shrink-0 ${iconColor}`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0">
                    {actor?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={actor.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <UserIcon size={16} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">
                      <span className="font-bold text-foreground">{actor?.display_name || 'Someone'}</span>
                      {' '}
                      <span className="text-muted-foreground">{text}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
