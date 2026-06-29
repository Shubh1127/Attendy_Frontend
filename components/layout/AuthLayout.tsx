import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";
// import {useRouter} from "next/navigation";

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
  panel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  panel: React.ReactNode;
}) {
  // const router=useRouter();
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10 sm:py-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <div className="w-full max-w-md">
            <p className="font-mono text-eyebrow uppercase text-muted">{eyebrow}</p>
            <h1 className="mt-2 font-display text-display-md font-medium text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted">{description}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden border-l border-border bg-surface-muted lg:flex lg:flex-col lg:justify-end">
        {panel}
      </div>
    </div>
  );
}
