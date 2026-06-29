"use client";

import { useRouter } from "next/navigation";
import { Mic, ScanFace } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { MethodTabs } from "@/components/auth/MethodTabs";
// import { FaceCapture } from "@/components/auth/FaceCapture";
// import { AudioCapture } from "@/components/auth/AudioCapture";
import { endpoints } from "@/lib/api/endpoints";
import { useSession } from "@/lib/hooks/useSession";
// import type { BiometricLoginResult } from "@/lib/api/types";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Formik, Field, Form, FormikHelpers } from "formik";
import { useState, useEffect } from "react";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}
interface LoginData {
  email: string;
  password: string;
}
export default function TeacherLoginPage() {
  const { session, status, setSession } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user.role === "teacher") {
      router.replace("/teacher/dashboard");
    }
  }, [status, session, router]);

  return (
    <AuthLayout
      eyebrow="Faculty access"
      title="Welcome back, professor"
      description="Sign in to open today's sessions and review your registers."
      panel={<SidePanel />}
    >
      <MethodTabs
        defaultValue="register"
        options={[
          { value: "register", label: "register", icon: ScanFace },
          { value: "login", label: "login", icon: Mic },
        ]}
      >
        {(active) =>
          active === "register" ? (
            <Formik
              initialValues={{
                name: "",
                email: "",
                password: "",
              }}
              onSubmit={async (
                values: RegisterData,
                { setSubmitting }: FormikHelpers<RegisterData>,
              ) => {
                setTimeout(async () => {
                  try {
                    const response = await endpoints.teacherRegister(
                      values.email,
                      values.password,
                      values.name,
                    );

                    if (!response.ok) {
                      setSubmitting(false);
                      setError(
                        response.error?.message || "Registration failed",
                      );
                      throw new Error("Registration failed");
                    }
                    const { token, expiresAt, teacher } = response.data;

                    setSession({
                      token,
                      expiresAt,
                      user: teacher,
                    });
                    router.push("/teacher/dashboard");
                  } catch (error) {
                    console.error(error);
                    setError(
                      error instanceof Error
                        ? error.message
                        : "Registration failed",
                    );
                  }

                  setSubmitting(false);
                }, 500);
              }}
            >
              <Form className="space-y-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Name
                </label>
                <Field
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  placeholder="john@acme.com"
                  type="email"
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  placeholder="********"
                  type="password"
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-sm px-3 my-3 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Submit
                </button>
              </Form>
            </Formik>
          ) : (
            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              onSubmit={(
                values: LoginData,
                { setSubmitting }: FormikHelpers<LoginData>,
              ) => {
                setTimeout(async () => {
                  try {
                    const response = await endpoints.teacherLogin(
                      values.email,
                      values.password,
                    );
                    if (!response.ok) {
                      setSubmitting(false);
                      setError(response.error?.message || "Login failed");
                      throw new Error("Login failed");
                    }
                    const { token, expiresAt, teacher } = response.data;

                    setSession({
                      token,
                      expiresAt,
                      user: teacher,
                    });
                    router.push("/teacher/dashboard");
                  } catch (err) {
                    console.error("Login failed:", err);
                    setError(
                      err instanceof Error ? err.message : "Login failed",
                    );
                  }
                  setSubmitting(false);
                }, 500);
              }}
            >
              <Form className="space-y-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  placeholder="john@acme.com"
                  type="email"
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-muted-foreground"
                >
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  placeholder="********"
                  type="password"
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-sm px-2 my-3 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Submit
                </button>
              </Form>
            </Formik>
          )
        }
      </MethodTabs>
      {error && <p className="text-red-500">{error}</p>}
    </AuthLayout>
  );
}

function SidePanel() {
  return (
    <div className="relative flex h-full flex-col justify-between p-10">
      <div className="ledger-field absolute inset-0 opacity-60" aria-hidden />
      <div className="relative space-y-1">
        <p className="font-mono text-eyebrow uppercase text-muted">
          CSDS-401 · Machine Learning
        </p>
        <p className="font-display text-2xl text-foreground">
          This week's average
        </p>
      </div>
      <div className="relative flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted">58 students enrolled</p>
          <p className="text-sm text-muted">3 sessions this week</p>
        </div>
        <ProgressRing value={0.91} size={84} strokeWidth={7} />
      </div>
    </div>
  );
}
