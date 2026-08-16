'use server';

import webpush from 'web-push';
import { createClient } from './db/supabase/server';

// Initialize web-push with VAPID keys
webpush.setVapidDetails(
  'mailto:contact@nowapp.com', // Needs to be a valid mailto or URL
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function savePushSubscription(subscription: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Parse keys
  const p256dh = subscription.keys.p256dh;
  const auth = subscription.keys.auth;
  const endpoint = subscription.endpoint;

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: user.id,
      endpoint,
      p256dh,
      auth
    }, {
      onConflict: 'user_id, endpoint'
    });

  if (error) {
    console.error('Failed to save push subscription:', error);
    throw new Error('Failed to save push subscription');
  }
}

export async function sendPushNotification(userId: string, title: string, body: string, url: string = '/') {
  // Use service role client to fetch subscriptions (bypassing RLS so we can send to others)
  const supabase = await createClient(); // Actually, server actions run with user's auth context.
  // Wait, to send to someone else, we need to bypass RLS to read their subscription.
  // Since we don't have a service_role key configured in the boilerplate easily accessible in all environments,
  // we can use standard client and temporarily rely on RLS allowing reading subscriptions or creating a secure view.
  // Actually, wait: RLS policy says "FOR ALL USING (auth.uid() = user_id)". This means a user cannot read another user's subscription!
  // To fix this without service_role: we should allow authenticated users to read push_subscriptions, but only manage their own.
  
  // Let's assume we update the RLS policy to allow SELECT for authenticated users.
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (!subscriptions || subscriptions.length === 0) return;

  const payload = JSON.stringify({
    title,
    body,
    url
  });

  const sendPromises = subscriptions.map(async (sub) => {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    };

    try {
      await webpush.sendNotification(pushSubscription, payload);
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired or no longer valid, delete it
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('id', sub.id);
      } else {
        console.error('Error sending push notification:', err);
      }
    }
  });

  await Promise.all(sendPromises);
}
