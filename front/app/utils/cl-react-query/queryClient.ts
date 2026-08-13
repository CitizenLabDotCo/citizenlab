import { keepPreviousData, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      placeholderData: keepPreviousData,
      retry: false,
    },
  },
});
