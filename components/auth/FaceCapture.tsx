"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, RotateCcw, CheckCircle2, VideoOff } from "lucide-react";

import { useWebcam } from "@/lib/hooks/useWebcam";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";

type Stage = "live" | "captured";

interface FaceCaptureProps {
  title?: string;
  description?: string;
  ctaLabel?: string;

  /**
   * Called after a face is captured.
   * Parent component decides what to do next.
   */
  onCapture: (image: Blob) => void;
  onContinue: () => void;
  onRetake?: () => void;
}

export function FaceCapture({
  title = "Look into the frame",
  description = "Center your face in good lighting and capture your face.",
  ctaLabel = "Capture Face",
  onCapture,
  onContinue,
  onRetake
}: FaceCaptureProps) {
  const { videoRef, status, errorMessage, start, stop, captureFrame } =
    useWebcam();

  const [stage, setStage] = useState<Stage>("live");
  // const [capturedBlob, setCapturedBlob] =  useState<Blob | null>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const handleCapture = async () => {
    const blob = await captureFrame();

    if (!blob) return;

    if (snapshotUrl) {
      URL.revokeObjectURL(snapshotUrl);
    }

    const url = URL.createObjectURL(blob);

    setSnapshotUrl(url);
    // setCapturedBlob(blob);
    stop();

    setStage("captured");

    onCapture(blob);
  };

  const retake =async () => {
    if (snapshotUrl) {
      URL.revokeObjectURL(snapshotUrl);
    }

    setSnapshotUrl(null);
    setStage("live");
    await start();
    onRetake?.();
  };

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative h-60 w-60 overflow-hidden rounded-full border border-border bg-surface-muted sm:h-64 sm:w-64">
        {stage === "live" && (
  <>
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="h-full w-full -scale-x-100 object-cover"
    />

    {status === "ready" && (
      <>
        <span
          className="scan-ring animate-scan-pulse text-primary"
          aria-hidden
        />

        <span
          className="absolute inset-0 rounded-full ring-1 ring-inset ring-primary/40"
          aria-hidden
        />
      </>
    )}

    {status === "requesting" && (
      <div className="absolute inset-0 flex items-center justify-center bg-surface text-xs text-muted">
        Asking for camera access...
      </div>
    )}
  </>
)}
        {stage === "captured" && snapshotUrl && (
          <img
            src={snapshotUrl}
            alt="Captured Face"
            className="h-full w-full -scale-x-100 object-cover"
          />
        )}

        {status === "requesting" && (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            Asking for camera access...
          </div>
        )}

        {(status === "denied" ||
          status === "unavailable" ||
          status === "error") && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-xs text-muted">
            <VideoOff className="h-5 w-5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <AnimatePresence>
          {stage === "captured" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2"
            >
              <div className="flex items-center gap-2 rounded-full bg-background px-3 py-1 shadow">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium">Face Captured</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center">
        <p className="font-display text-base font-medium text-foreground">
          {title}
        </p>

        <p className="text-sm text-muted">{description}</p>
      </div>

      {(status === "denied" ||
        status === "unavailable" ||
        status === "error") && (
        <Notice
          tone="error"
          title="Camera unavailable"
          description={errorMessage || "Camera is unavailable."}
          className="w-full max-w-sm"
        />
      )}

      <div className="flex gap-3">
        {stage === "live" && status === "ready" && (
          <Button
            onClick={handleCapture}
            leftIcon={<Camera className="h-4 w-4" />}
          >
            {ctaLabel}
          </Button>
        )}

        {stage === "captured" && (
          <>
            <Button
              variant="outline"
              onClick={retake}
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Retake
            </Button>

            <Button onClick={onContinue}>Continue</Button>
          </>
        )}

        {(status === "denied" ||
          status === "unavailable" ||
          status === "error") && (
          <Button
            variant="outline"
            onClick={start}
            leftIcon={<RotateCcw className="h-4 w-4" />}
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
