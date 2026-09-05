import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-brand shadow-glow transition-transform group-hover:scale-105">
        <Sparkles className="h-4 w-4 text-white" />
      </span>
      <span className="text-base font-bold tracking-tight">
        Prompt<span className="text-gradient-brand">Studio</span>
      </span>
    </Link>
  );
}
