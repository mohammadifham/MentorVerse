'use client';

import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import type { AttentionStatus } from '@/lib/types';

interface AttentionMonitorProps {
  onStatusChange?: (status: AttentionStatus) => void;
}

export function AttentionMonitor({ onStatusChange }: AttentionMonitorProps) {
  const webcamRef = useRef<Webcam | null>(null);
  const [status, setStatus] = useState<AttentionStatus>('Preparing');
  const [details, setDetails] = useState('Loading camera and detection model...');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let intervalId: number | undefined;
    let faceApiModule: typeof import('face-api.js') | null = null;
    let detectionOptions: any = null;
    let modelsLoaded = false;

    async function loadModels() {
      try {
        faceApiModule = await import('face-api.js');
        detectionOptions = new faceApiModule.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.45 });
        await faceApiModule.nets.tinyFaceDetector.loadFromUri('/models');
        if (!mounted) {
          return;
        }
        modelsLoaded = true;
        setReady(true);
        setStatus('Focused');
        setDetails('Camera is active. Face detection runs every 2 seconds.');
        onStatusChange?.('Focused');

        intervalId = window.setInterval(() => {
          void checkAttention();
        }, 2000);
        void checkAttention();
      } catch {
        if (!mounted) {
          return;
        }
        setStatus('Distracted');
        setDetails('Face detection models are unavailable. Add them to /public/models to enable live attention tracking.');
        onStatusChange?.('Distracted');
      }
    }

    async function checkAttention() {
      const video = webcamRef.current?.video;
      if (!video || video.readyState !== 4 || !faceApiModule || !detectionOptions || !modelsLoaded) {
        return;
      }

      try {
        const detection = await faceApiModule.detectSingleFace(video, detectionOptions);
        const nextStatus: AttentionStatus = detection ? 'Focused' : 'Distracted';
        setStatus(nextStatus);
        setDetails(detection ? 'Face detected. The learner is engaged.' : 'No face detected. The learner may be distracted.');
        onStatusChange?.(nextStatus);
      } catch {
        setStatus('Distracted');
        setDetails('Attention detection failed temporarily.');
        onStatusChange?.('Distracted');
      }
    }

    void loadModels();

    return () => {
      mounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [onStatusChange]);

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-violet-900/20 backdrop-blur">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Attention Detection</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Webcam monitor</h3>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-medium ${status === 'Focused' ? 'bg-emerald-400/15 text-emerald-300' : status === 'Distracted' ? 'bg-rose-400/15 text-rose-300' : 'bg-slate-400/15 text-slate-300'}`}>
          {status}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored
            screenshotFormat="image/jpeg"
            className="h-full w-full object-cover"
            videoConstraints={{ facingMode: 'user' }}
          />
        </div>
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
          <div>
            <p className="text-sm text-slate-300">Status</p>
            <p className="mt-2 text-2xl font-semibold text-white">{status}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{details}</p>
          </div>
          <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-xs text-cyan-100">
            {ready ? 'Detection is live. The system updates every 2 seconds.' : 'Preparing camera feed and loading face-api.js model.'}
          </div>
        </div>
      </div>
    </section>
  );
}
