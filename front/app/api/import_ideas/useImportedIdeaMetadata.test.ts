import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { ideaImport } from './__mocks__/useImportedIdeaMetadata';
import useImportedIdeaMetadata from './useImportedIdeaMetadata';

const apiPath = '*idea_imports/:id';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: ideaImport }, { status: 200 });
  })
);

describe('useImportedIdeaMetadata', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useImportedIdeaMetadata({ id: '1' }), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(ideaImport);
  });
});
