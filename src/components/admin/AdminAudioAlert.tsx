'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Bell, BellOff, Volume2, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

interface NewOrderNotification {
  id: string;
  order_number: string;
  total_amount: number;
  created_at: string;
}

export function AdminAudioAlert() {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notification, setNotification] = useState<NewOrderNotification | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const originalTitleRef = useRef<string>('');

  // Save/load sound preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      originalTitleRef.current = document.title;
      const saved = localStorage.getItem('kairo_desk_sound_enabled');
      if (saved !== null) {
        setSoundEnabled(saved === 'true');
      }
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('kairo_desk_sound_enabled', String(next));
    if (next) {
      playChime();
    }
  };

  // Synthesize a double desk bell chime (880Hz A5 followed by 1174Hz D6 harmonic chime)
  const playChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Tone 1: High crisp ding
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.55);

      // Tone 2: Warm campus desk bell chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(587.33, now + 0.09); // D5
      gain2.gain.setValueAtTime(0.3, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.75);

      setAudioUnlocked(true);
    } catch (err) {
      console.warn('Could not synthesize chime:', err);
    }
  }, []);

  // Unlock AudioContext on first user interaction
  useEffect(() => {
    const unlock = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setAudioUnlocked(true);
    };

    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Realtime subscription for incoming orders
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('kairo-admin-orders-audio-alert')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const newOrder = payload.new as any;
          if (newOrder) {
            setNotification({
              id: newOrder.id,
              order_number: newOrder.order_number,
              total_amount: newOrder.total_amount,
              created_at: newOrder.created_at,
            });

            // Play bell sound
            if (soundEnabled) {
              playChime();
            }

            // Update title alert
            document.title = `🔔 NEW ORDER! (${newOrder.order_number}) - Kairo Desk`;

            // Refresh Next.js server components if on admin pages
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled, playChime, router]);

  const dismissNotification = () => {
    setNotification(null);
    if (originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }
  };

  return (
    <>
      {/* Audio Toggle Floating Widget in Admin Header/Corner */}
      <div className="fixed top-3 right-4 z-40 flex items-center gap-2 font-mono-code text-[11px]">
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Desk order chime is active. Click to mute.' : 'Desk chime is muted. Click to enable sound.'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 border transition-all shadow-xs cursor-pointer ${
            soundEnabled
              ? 'bg-[#111215] text-[#FBF9F5] border-[#26282E] hover:bg-[#1D4ED8]'
              : 'bg-white text-[#98948C] border-[#D8D1C3] hover:text-[#111215]'
          }`}
        >
          {soundEnabled ? (
            <>
              <Bell className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline font-bold">CHIME ON</span>
            </>
          ) : (
            <>
              <BellOff className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-bold">CHIME MUTED</span>
            </>
          )}
        </button>

        {soundEnabled && (
          <button
            onClick={playChime}
            title="Test desk chime bell"
            className="p-1.5 bg-white border border-[#D8D1C3] text-[#65625D] hover:text-[#111215] hover:border-[#111215] transition-colors cursor-pointer"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Floating Incoming Order Banner Alert */}
      {notification && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] bg-[#111215] text-white border-2 border-amber-400 shadow-2xl p-4 font-mono-code animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                Incoming Requisition Received!
              </span>
            </div>
            <button
              onClick={dismissNotification}
              className="text-[#98948C] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 bg-[#1A1C22] p-2.5 border border-[#2D313A] space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-sm text-white tracking-wide">
                {notification.order_number}
              </span>
              <span className="font-display font-black text-sm text-amber-400">
                ₹{notification.total_amount?.toFixed(2)}
              </span>
            </div>
            <p className="text-[10px] text-[#98948C]">
              Just arrived at desk queue · Ready for printing
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/admin/orders/${notification.id}`}
              onClick={dismissNotification}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#1D4ED8] hover:bg-[#1e40af] text-white py-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <span>Inspect &amp; Print</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={dismissNotification}
              className="border border-[#3E424B] hover:bg-[#26282E] text-[#98948C] hover:text-white px-3 py-2 text-xs transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}
