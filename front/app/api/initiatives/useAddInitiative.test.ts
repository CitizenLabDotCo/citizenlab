import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { initiativesData } from './__mocks__/_mockServer';
import useAddInitiative from './useAddInitiative';

const apiPath = '*initiatives';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: initiativesData[0] }, { status: 200 });
  })
);

describe('useAddInitiative', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddInitiative(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        publication_status: 'published',
        title_multiloc: {
          en: 'test',
        },
        body_multiloc: {
          en: 'test',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(initiativesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(() => useAddInitiative(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        publication_status: 'published',
        title_multiloc: {
          en: 'test',
        },
        body_multiloc: {
          en: 'test',
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
