"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderStatus = "idle" | "requesting" | "recording" | "denied" | "unavailable" | "error";

interface UseAudioRecorderReturn {
  status: RecorderStatus;
  errorMessage: string | null;
  /** 0..1 live amplitude, sampled ~20x/sec while recording — drives the waveform UI. */
  level: number;
  elapsedMs: number;
  start: () => Promise<void>;
  /** Stops recording and resolves the captured audio as a Blob. */
  stop: () => Promise<Blob | null>;
}

const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];

/**
 * Wraps getUserMedia(audio) + MediaRecorder for voice login/enrollment.
 * Exposes a live amplitude level so the UI can render a responsive waveform
 * instead of a static "recording…" spinner.
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanupAudioGraph = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unavailable");
      setErrorMessage("This browser doesn't support microphone access.");
      return;
    }
    setStatus("requesting");
    setErrorMessage(null);
    setElapsedMs(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.start();
      recorderRef.current = recorder;

      // Amplitude metering for the waveform UI
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = ((data[i] ?? 128) - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        setLevel(Math.min(1, rms * 4));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();

      startedAtRef.current = Date.now();
      timerRef.current = setInterval(() => setElapsedMs(Date.now() - startedAtRef.current), 100);

      setStatus("recording");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setStatus("denied");
        setErrorMessage("Microphone access was denied. Allow it in your browser settings to continue.");
      } else if (name === "NotFoundError") {
        setStatus("unavailable");
        setErrorMessage("No microphone was found on this device.");
      } else {
        setStatus("error");
        setErrorMessage("Couldn't start recording. Try again.");
      }
    }
  }, []);

  const stop = useCallback(async (): Promise<Blob | null> => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return null;

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      };
      recorder.stop();
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cleanupAudioGraph();
    setLevel(0);
    setStatus("idle");
    return blob;
  }, [cleanupAudioGraph]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    cleanupAudioGraph();
  }, [cleanupAudioGraph]);

  return { status, errorMessage, level, elapsedMs, start, stop };
}
