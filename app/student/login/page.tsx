"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { FaceCapture } from "@/components/auth/FaceCapture";
import { AudioCapture } from "@/components/auth/AudioCapture";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Notice";

import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";

export default function StudentLoginPage() {
  const router = useRouter();

  const { setSession } = useSession();

  const [step, setStep] = useState<"face" | "voice">("face");

  const [enrollmentNumber, setEnrollmentNumber] = useState("");

  const [faceImage, setFaceImage] = useState<Blob | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleFaceCapture = async (image: Blob) => {
    if (!enrollmentNumber.trim()) {
      setError("Please enter your enrollment number.");
      return;
    }

    setLoading(true);

    setError("");

    setFaceImage(image);

    const result = await endpoints.verifyStudent(enrollmentNumber, image);

    setLoading(false);

    if (!result.ok) {
      setError(result.error.message);
      return;
    }

    if (result.data.action === "voice_required") {
      setStep("voice");

      return;
    }

    setSession({
      token: result.data.token!,
      expiresAt: result.data.expiresAt!,
      user: {
        id: result.data.student_id!,
        name: result.data.student_name!,
        role: "student",
      },
    });

    router.push("/student/dashboard");
  };

  const handleVoiceCapture = async (audio: Blob) => {
    if (!faceImage) {
      setError("Capture your face first.");

      return;
    }

    setLoading(true);

    const result = await endpoints.verifyStudent(
      enrollmentNumber,
      faceImage,
      audio,
    );

    setLoading(false);

    if (!result.ok) {
      setError(result.error.message);

      return;
    }

    setSession({
      token: result.data.token!,
      expiresAt: result.data.expiresAt!,
      user: {
        id: result.data.student_id!,
        name: result.data.student_name!,
        role: "student",
      },
    });

    router.push("/student/dashboard");
  };

  return (
    <AuthLayout
      eyebrow="Student Access"
      title="Sign in to Snap Class"
      description="Enter your enrollment number and verify your identity using face recognition."
      panel={<SidePanel />}
    >
      {step === "face" && (
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Enrollment Number
            </label>

            <input
              type="text"
              value={enrollmentNumber}
              onChange={(e) => setEnrollmentNumber(e.target.value)}
              placeholder="Enter Enrollment Number"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:border-primary"
            />
          </div>

          <FaceCapture
            onCapture={(blob) => setFaceImage(blob)}
            onRetake={() => setFaceImage(null)}
            onContinue={() => {
              if (faceImage) {
                handleFaceCapture(faceImage);
              }
            }}
          />

          {loading && (
            <Notice
              tone="info"
              title="Verifying..."
              description="Please wait while we verify your face."
            />
          )}

          {error && (
            <Notice
              tone="error"
              title="Verification Failed"
              description={error}
            />
          )}
        </div>
      )}

      {step === "voice" && (
        <div className="space-y-6">
          <Notice
            tone="info"
            title="Voice Enrollment Required"
            description="This appears to be your first login. Please record your voice once to complete your registration."
          />

          <AudioCapture onCapture={handleVoiceCapture} onContinue={() => {}} />

          {loading && (
            <Notice
              tone="info"
              title="Registering..."
              description="Generating your voice embedding..."
            />
          )}

          {error && (
            <Notice
              tone="error"
              title="Registration Failed"
              description={error}
            />
          )}
        </div>
      )}
    </AuthLayout>
  );
}

function SidePanel() {
  return (
    <div className="relative flex h-full flex-col justify-between p-10">

      <div
        className="ledger-field absolute inset-0 opacity-60"
        aria-hidden
      />

      <div className="relative space-y-2">

        <p className="font-mono text-eyebrow uppercase text-muted">
          Snap Class
        </p>

        <h2 className="font-display text-3xl text-foreground">
          Secure Student Login
        </h2>

        <p className="text-sm leading-6 text-muted">
          Sign in using your enrollment number and facial verification.
          First-time students will be asked to register their voice
          after successful face verification.
        </p>

      </div>

      <div className="relative space-y-6">

        <Feature
          title="Face Verification"
          description="Every login verifies your face before granting access."
        />

        <Feature
          title="One-time Voice Enrollment"
          description="Your voice is recorded only during your first login."
        />

        <Feature
          title="Secure Attendance"
          description="Biometric authentication prevents proxy attendance."
        />

      </div>

    </div>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="ruled-row space-y-1 py-3">

      <h3 className="font-medium text-foreground">
        {title}
      </h3>

      <p className="text-sm text-muted">
        {description}
      </p>

    </div>
  );
}
