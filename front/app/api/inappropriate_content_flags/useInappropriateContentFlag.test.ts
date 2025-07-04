import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { IInappropriateContentFlagData } from './types';
import useInappropriateContentFlag from './useInappropriateContentFlag';

const apiPath = '*inappropriate_content_flags/:id';

const data: IInappropriateContentFlagData = {
  id: '1',
  type: 'inappropriate_content_flag',
  attributes: {
    reason_code: 'inappropriate',
    deleted_at: '2021-02-11T15:50:06.000Z',
    toxicity_label: 'insult',
  },
  relationships: {
    flaggable: {
      data: {
        id: '1',
        type: 'idea',
      },
    },
  },
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data }, { status: 200 });
  })
);

describe('useInappropriateContentFlag', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useInappropriateContentFlag('1'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(data);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useInappropriateContentFlag('1'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
