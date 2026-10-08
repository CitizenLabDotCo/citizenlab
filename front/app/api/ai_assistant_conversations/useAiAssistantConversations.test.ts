import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useAiAssistantConversations from './useAiAssistantConversations';

const apiPath = '*ai_assistant_conversations';

const server = setupServer(
  http.get(apiPath, () => HttpResponse.json({ data: [] }, { status: 200 }))
);

describe('useAiAssistantConversations', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('looks up the conversation of the context', async () => {
    let requestUrl: URL | undefined;
    server.use(
      http.get(apiPath, ({ request }) => {
        requestUrl = new URL(request.url);
        return HttpResponse.json({ data: [] }, { status: 200 });
      })
    );

    const { result } = renderHook(
      () =>
        useAiAssistantConversations({
          contextKey: 'survey_builder',
          contextId: 'phase-1',
        }),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestUrl?.searchParams.get('context_key')).toBe('survey_builder');
    expect(requestUrl?.searchParams.get('context_id')).toBe('phase-1');
  });
});
