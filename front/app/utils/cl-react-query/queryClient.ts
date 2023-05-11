import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      keepPreviousData: true,
      retry: (_, error) => {
        if (typeof error !== 'string') return true;
        return !error.includes("Couldn't find");
      },
    },
  },
});
