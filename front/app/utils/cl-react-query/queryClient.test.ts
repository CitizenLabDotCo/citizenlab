import { keepPreviousData } from '@tanstack/react-query';

import { NO_PLACEHOLDER_DATA, queryClient } from './queryClient';

describe('queryClient', () => {
  it('keeps the previous key’s data while a new query key loads', () => {
    const options = queryClient.defaultQueryOptions({ queryKey: ['test'] });

    expect(options.placeholderData).toBe(keepPreviousData);
  });

  // NO_PLACEHOLDER_DATA only overrides the default because object spread copies
  // keys that are explicitly set to undefined. Assert it, so the opt-out can't
  // silently stop working for the queries that rely on it.
  it('lets a query opt out of that default with NO_PLACEHOLDER_DATA', () => {
    const options = queryClient.defaultQueryOptions({
      queryKey: ['test'],
      placeholderData: NO_PLACEHOLDER_DATA,
    });

    expect(options.placeholderData).toBeUndefined();
  });
});
