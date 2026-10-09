import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { ideasData } from './__mocks__/useImportedIdeas';
import useApprovedImportedIdeas from './useApprovedImportedIdeas';

const apiPath = '*phases/:phaseId/importer/approved_records/idea';

const links = {
  self: 'http://localhost/web_api/v1/phases/1/importer/approved_records/idea?page%5Bnumber%5D=1&page%5Bsize%5D=10',
  first:
    'http://localhost/web_api/v1/phases/1/importer/approved_records/idea?page%5Bnumber%5D=1&page%5Bsize%5D=10',
  last: 'http://localhost/web_api/v1/phases/1/importer/approved_records/idea?page%5Bnumber%5D=1&page%5Bsize%5D=10',
  prev: null,
  next: null,
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: ideasData, links }, { status: 200 });
  })
);

describe('useApprovedImportedIdeas', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly and reports no further pages', async () => {
    const { result } = renderHook(
      () => useApprovedImportedIdeas({ projectId: '1', phaseId: '1' }),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0].data).toEqual(ideasData);
    expect(result.current.hasNextPage).toBe(false);
  });
});
