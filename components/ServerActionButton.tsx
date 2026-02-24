"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { sileo } from "sileo";

type ActionResult = {
  success: boolean;
  error?: string;
};

type ServerActionButtonProps<T> = {
  action: (payload: T) => Promise<ActionResult>;
  payload: T;
  loadingTitle: string;
  successTitle: string;
  errorTitle: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary";
  size?: "sm" | "lg" | "default";
  className?: string;
};

export function ServerActionButton<T>({
  action,
  payload,
  loadingTitle,
  successTitle,
  errorTitle,
  children,
  variant = "default",
  size = "default",
  className,
}: ServerActionButtonProps<T>) {
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await sileo.promise(
        action(payload),
        {
          loading: { title: loadingTitle },
          success: { title: successTitle },
          error: { title: errorTitle },
        }
      );

      if (!result?.success && result?.error) {
        console.error(result.error);
      }
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={pending}
      variant={variant}
      size={size}
      className={className}
    >
      {children}
    </Button>
  );
}
