import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { phaseFilesData } from './__mocks__/usePhaseFiles';
import useAddPhaseFile from './useAddPhaseFile';

const apiPath = '*phases/:phaseId/files';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: phaseFilesData }, { status: 200 });
  })
);

describe('useAddPhaseFile', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddPhaseFile(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: 'phaseId',
        name: 'file name',
        ordering: 1,
        base64: 'test file',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(phaseFilesData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddPhaseFile(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: 'phaseId',
        name: 'file name',
        ordering: 1,
        base64: 'test file',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
