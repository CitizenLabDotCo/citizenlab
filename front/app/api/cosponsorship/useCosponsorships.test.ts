import { renderHook } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { cosponsorshipData } from './__mocks__/useCosponsorships';
import { ICosponsorshipParameters } from './types';
import useCosponsorships from './useCosponsorships';

const apiPath = '*/ideas/:ideaId/cosponsorships/:id';

const params: ICosponsorshipParameters = {
  ideaId: '1',
  id: '2',
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: cosponsorshipData }, { status: 200 });
  })
);

describe('useCosponsorships', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(() => useCosponsorships(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(cosponsorshipData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(() => useCosponsorships(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
