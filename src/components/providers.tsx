"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ImageKitProvider } from "imagekitio-next";
import { useState } from "react";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider>
            <ImageKitProvider
              urlEndpoint={urlEndpoint}
              publicKey={publicKey}
            >
              {children}
            </ImageKitProvider>
            <Toaster richColors />
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
