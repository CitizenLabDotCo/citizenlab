import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createQueryClientWrapper() {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    logger: {
      // eslint-disable-next-line no-console
      log: console.log,
      warn: console.warn,
      error: () => {},
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default createQueryClientWrapper;
