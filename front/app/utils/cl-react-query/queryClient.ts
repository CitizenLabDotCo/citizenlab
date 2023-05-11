import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      keepPreviousData: true,
      retry: (_, error) => {
        if (process.env.NODE_ENV === 'test') return false;

        if (typeof error !== 'string') return true;
        return !error.includes("Couldn't find");
      },
    },
  },
});
