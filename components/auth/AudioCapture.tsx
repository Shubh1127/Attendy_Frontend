"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, RotateCcw, CheckCircle2, Square } from "lucide-react";

import { useAudioRecorder } from "@/lib/hooks/useAudioRecorder";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";
import { formatDuration } from "@/lib/utils/file";

const MAX_DURATION_MS = 5000;
const BAR_COUNT = 24;

type Stage = "idle" | "recording" | "captured";

interface AudioCaptureProps {
  title?: string;
  description?: string;
  phrase?: string;

  /**
   * Returns recorded audio to parent.
   */
  onCapture: (audio: Blob) => void;
  onContinue: () => void;

  onRetake?: () => void;
}

export function AudioCapture({
  title = "Voice Enrollment",
  description = "Speak naturally into the microphone.",
  phrase = "This is my voice, this is my class.",
  onCapture,
  onContinue,
  onRetake,
}: AudioCaptureProps) {
  const { status, errorMessage, level, elapsedMs, start, stop } =
    useAudioRecorder();

  const [stage, setStage] = useState<Stage>("idle");

  const barsRef = useRef<number[]>(Array(BAR_COUNT).fill(0.08));

  const [, forceRender] = useState(0);

  useEffect(() => {
    if (stage !== "recording") return;

    barsRef.current = [level, ...barsRef.current.slice(0, BAR_COUNT - 1)];

    forceRender((v) => v + 1);
  }, [level, stage]);

  useEffect(() => {
    if (stage === "recording" && elapsedMs >= MAX_DURATION_MS) {
      handleStop();
    }
  }, [elapsedMs, stage]);

  const handleStart = async () => {
    setStage("recording");

    barsRef.current = Array(BAR_COUNT).fill(0.08);

    await start();
  };

  const handleStop = async () => {
    const blob = await stop();

    if (!blob) {
      setStage("idle");
      return;
    }

    setStage("captured");

    onCapture(blob);
  };

  const recordAgain = () => {
    setStage("idle");

    onRetake?.();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative flex h-60 w-60 flex-col items-center justify-center gap-4 rounded-full border border-border bg-surface-muted sm:h-64 sm:w-64">
        {stage === "captured" ? (
          <motion.div
            initial={{
              scale: 0.7,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            className="flex flex-col items-center gap-3"
          >
            <CheckCircle2 className="h-12 w-12 text-green-600" />

            <span className="font-medium">Voice Recorded</span>
          </motion.div>
        ) : (
          <>
            <div className="flex h-16 items-center gap-[3px]" aria-hidden>
              {barsRef.current.map((v, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-primary transition-[height] duration-100"
                  style={{
                    height: `${8 + v * 56}px`,
                    opacity: stage === "recording" ? 1 : 0.25,
                  }}
                />
              ))}
            </div>

            <button
              onClick={stage === "recording" ? handleStop : handleStart}
              disabled={
                status === "requesting" ||
                status === "denied" ||
                status === "unavailable"
              }
              className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform active:scale-95 disabled:opacity-40"
            >
              {stage === "recording" ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>

            {stage === "recording" && (
              <span className="font-mono text-xs text-muted">
                {formatDuration(elapsedMs)} / {formatDuration(MAX_DURATION_MS)}
              </span>
            )}
          </>
        )}

        {(status === "denied" || status === "unavailable") && (
          <div className="absolute inset-x-6 bottom-7 flex flex-col items-center gap-1 text-center text-xs text-muted">
            <MicOff className="h-4 w-4" />

            {errorMessage}
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="font-display text-base font-medium text-foreground">
          {title}
        </p>

        <p className="text-sm text-muted">{description}</p>

        <p className="mt-1 font-mono text-xs text-muted">"{phrase}"</p>
      </div>

      {(status === "denied" || status === "unavailable") && (
        <Notice
          tone="error"
          title="Microphone unavailable"
          description={errorMessage || "Please check your microphone settings."}
          className="w-full max-w-sm"
        />
      )}

      {stage === "captured" && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={recordAgain}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Record Again
          </Button>

          <Button onClick={onContinue}>Finish Registration</Button>
        </div>
      )}
    </div>
  );
}
