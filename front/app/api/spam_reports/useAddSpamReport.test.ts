import { renderHook, act } from '@testing-library/react-hooks';

import useAddSpamReport from './useAddSpamReport';
import { spamReportData } from './__mocks__/usAddSpamReport';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/comments/:targetId/spam_reports';
const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: spamReportData[0] }));
  })
);

describe('useAddSpamReport', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddSpamReport(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        targetId: 'id',
        targetType: 'comments',
        spam_report: {
          reason_code: 'other',
          other_reason: 'Gibberish',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(spamReportData[0]);
  });
});
