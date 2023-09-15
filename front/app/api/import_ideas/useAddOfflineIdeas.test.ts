import { renderHook, act } from '@testing-library/react-hooks';

import useAddOfflineIdeas from './useAddOfflineIdeas';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { ideasData } from './__mocks__/useAddOfflineIdeas';

const apiPath = '*projects/:projectId/import_ideas/bulk_create';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: ideasData }));
  })
);

describe('useAddOfflineIdeas', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddOfflineIdeas(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        project_id: 'project1',
        pdf: 'data:application/pdf;base64,abc123',
        locale: 'en',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(ideasData);
  });
});
