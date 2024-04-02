import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { ideasData } from './__mocks__/useAddOfflineIdeas';
import useAddOfflineIdeas from './useAddOfflineIdeas';

const apiPath = '*phases/:phaseId/importer/idea/bulk_create/xlsx';

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
        phase_id: 'phase1',
        pdf: 'data:application/pdf;base64,abc123',
        locale: 'en',
        personal_data: false,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(ideasData);
  });
});
