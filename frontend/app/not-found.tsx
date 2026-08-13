import React from "react";
import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 w-full">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-[#E8F5F2] dark:bg-[#0B332C] text-[#0F6B5C] dark:text-[#148A77] flex items-center justify-center mx-auto">
          <FileQuestion className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            404 — Page Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            The page or meeting you are looking for does not exist or has been removed.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
