import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { ideasData } from './__mocks__/useImportedIdeas';
import useImportedIdeas from './useImportedIdeas';

const apiPath = '*phases/:phaseId/importer/draft_records/idea';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: ideasData }, { status: 200 });
  })
);

describe('useImportedIdeas', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useImportedIdeas({ phaseId: '1' }), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(ideasData);
  });
});
