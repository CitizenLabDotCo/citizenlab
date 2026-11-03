import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createQueryClientWrapper() {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default createQueryClientWrapper;
