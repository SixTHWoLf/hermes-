'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigPage } from '@/components/config/config-page';
import { useState } from 'react';

export default function Home() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigPage />
    </QueryClientProvider>
  );
}
