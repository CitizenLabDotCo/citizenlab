import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { eventFileData } from './__mocks__/useAddEvent';
import useAddEventFile from './useAddEventFile';

const apiPath = '*/events/:eventId/files';
const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: eventFileData }, { status: 200 });
  })
);

describe('useAddEventFile', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddEventFile(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        eventId: 'id',
        file: 'dummy.docx',
        name: 'base64',
        ordering: null,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(eventFileData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddEventFile(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        eventId: 'id',
        file: 'dummy.docx',
        name: 'base64',
        ordering: null,
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
