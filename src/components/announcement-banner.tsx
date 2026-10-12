'use client';

import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';

interface Announcement {
  text: string;
  type: 'info' | 'warning' | 'alert';
  active: boolean;
}

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/announcement');
        if (res.ok) {
          const data = await res.json();
          if (data.announcement?.active && data.announcement?.text) {
            setAnnouncement(data.announcement);
          }
        }
      } catch {}
    }
    load();
  }, []);

  if (!announcement || !announcement.active || dismissed) {
    return null;
  }

  const bgStyles =
    announcement.type === 'alert'
      ? 'border-rose-500/30 bg-rose-950/80 text-rose-200'
      : announcement.type === 'warning'
      ? 'border-amber-500/30 bg-amber-950/80 text-amber-200'
      : 'border-cyan-500/30 bg-cyan-950/80 text-cyan-200';

  return (
    <div className={`relative border-b px-4 py-2.5 backdrop-blur-md transition ${bgStyles}`}>
      <div className="container-shell flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <Megaphone className="h-4 w-4 shrink-0 animate-bounce" />
          <span>{announcement.text}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-1 text-slate-400 hover:text-white"
          title="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
