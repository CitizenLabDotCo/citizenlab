import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { project1 } from './__mocks__/_mockServer';
import useUpdateProject from './useUpdateProject';

const apiPath = '*projects/:projectId';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: project1 }, { status: 200 });
  })
);

describe('useUpdateProject', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateProject(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'id',
        title_multiloc: {
          en: 'new folder test',
          'fr-BE': 'new folder',
          'nl-BE': 'new folder',
          'nl-NL': 'new folder',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(project1);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateProject(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        projectId: 'id',
        title_multiloc: { en: 'name' },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
