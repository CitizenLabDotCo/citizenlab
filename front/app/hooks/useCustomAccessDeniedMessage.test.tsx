import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useCustomAccessDeniedMessage from './useCustomAccessDeniedMessage';

const apiPath =
  '*phases/:phaseId/permissions/:action/access_denied_explanation';

const requestedActions: string[] = [];

const server = setupServer(
  http.get(apiPath, ({ params }) => {
    requestedActions.push(String(params.action));
    return HttpResponse.json({
      data: {
        id: 'id',
        type: 'access_denied_explanation',
        attributes: {
          access_denied_explanation_multiloc: { en: '<p>Members only</p>' },
        },
      },
    });
  })
);

const renderIt = (disabledReason: string | null) =>
  renderHook(
    () =>
      useCustomAccessDeniedMessage({
        phaseId: 'phase-id',
        action: 'commenting_idea',
        disabledReason,
      }),
    { wrapper: createQueryClientWrapper() }
  );

describe('useCustomAccessDeniedMessage', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    requestedActions.length = 0;
    server.resetHandlers();
  });
  afterAll(() => server.close());

  it('fetches an explanation when the user is denied for a reason auth cannot fix', async () => {
    const { result } = renderIt('user_not_in_group');

    await waitFor(() => expect(result.current).not.toBeNull());
    expect(requestedActions).toEqual(['commenting_idea']);
  });

  // No Permission record exists for these, so the request would 404.
  it.each([
    'commenting_not_supported',
    'posting_not_supported',
    'reacting_not_supported',
    'not_voting',
  ])(
    'does not request an explanation when the action is %s',
    async (reason) => {
      const { result } = renderIt(reason);

      await waitFor(() => expect(result.current).toBeNull());
      expect(requestedActions).toEqual([]);
    }
  );

  it('does not request an explanation when the user just needs to sign in', async () => {
    const { result } = renderIt('user_not_signed_in');

    await waitFor(() => expect(result.current).toBeNull());
    expect(requestedActions).toEqual([]);
  });

  it('does not request an explanation when the action is enabled', async () => {
    const { result } = renderIt(null);

    await waitFor(() => expect(result.current).toBeNull());
    expect(requestedActions).toEqual([]);
  });
});
