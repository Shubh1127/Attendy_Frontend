"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type WebcamStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unavailable"
  | "error";

interface UseWebcamOptions {
  /** Start the camera as soon as the hook mounts. Defaults to true. */
  autoStart?: boolean;
  facingMode?: "user" | "environment";
}

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: WebcamStatus;
  errorMessage: string | null;
  start: () => Promise<void>;
  stop: () => void;
  /** Grabs the current video frame and resolves a JPEG Blob, or null if not ready. */
  captureFrame: () => Promise<Blob | null>;
}

/**
 * Wraps getUserMedia + a <video> element for biometric face capture. Keeps
 * the messy lifecycle (permissions, track cleanup, frame grabbing) out of
 * screen components so login/enrollment UIs stay declarative.
 */
export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
  const { autoStart = true, facingMode = "user" } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<WebcamStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // videoRef.current.srcObject = stream;

  const stop = useCallback(() => {
    console.log("Stopping webcam");
    console.log(streamRef.current);

    streamRef.current?.getTracks().forEach((track) => {
      console.log("Before:", track.readyState);
      track.stop();
      console.log("After:", track.readyState);
    });

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setStatus("unavailable");
      setErrorMessage("This browser doesn't support camera access.");
      return;
    }
    setStatus("requesting");
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        console.log("Stream assigned:", stream);
        console.log("Video element:", videoRef.current);

        try {
          await videoRef.current.play();
          console.log("Video playing");
        } catch (err) {
          console.error("Play failed:", err);
        }
      }
      setStatus("ready");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setStatus("denied");
        setErrorMessage(
          "Camera access was denied. Allow it in your browser settings to continue.",
        );
      } else if (name === "NotFoundError") {
        setStatus("unavailable");
        setErrorMessage("No camera was found on this device.");
      } else {
        setStatus("error");
        setErrorMessage("Couldn't start the camera. Try again.");
      }
    }
  }, [facingMode]);

  const captureFrame = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video || status !== "ready") return null;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92),
    );
  }, [status]);

  useEffect(() => {
    if (autoStart) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { videoRef, status, errorMessage, start, stop, captureFrame };
}
