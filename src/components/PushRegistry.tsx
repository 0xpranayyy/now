'use client';

import { useEffect, useState } from 'react';
import { savePushSubscription } from '@/lib/push';

// Helper to convert base64 to Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushRegistry() {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    async function registerPush() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return; // Push not supported
      }

      // Check if already registered
      if (localStorage.getItem('push_registered') === 'true') {
        setIsRegistered(true);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string)
        });

        // Save to DB via Server Action
        await savePushSubscription(JSON.parse(JSON.stringify(subscription)));
        localStorage.setItem('push_registered', 'true');
        setIsRegistered(true);
      } catch (error) {
        console.error('Push registration failed:', error);
      }
    }

    // Only attempt registration if user interacts or we want to prompt immediately (usually better to tie to a button)
    // For this app, we will attempt on mount but browsers may block if not user-initiated.
    // A better pattern is a "Enable Notifications" button, but we'll try automatically for simplicity.
    registerPush();
  }, []);

  return null; // Invisible component
}
