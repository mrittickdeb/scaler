"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 w-full">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Something went wrong
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {error.message || "An unexpected error occurred while loading this page."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => reset()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Try Again
          </Button>

          <Link href="/">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
