'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MonitoringDashboard } from '@/components/monitoring/monitoring-dashboard';
import { useState } from 'react';

export default function MonitoringPage() {
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
      <MonitoringDashboard />
    </QueryClientProvider>
  );
}
