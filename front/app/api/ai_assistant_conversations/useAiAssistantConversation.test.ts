import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useAiAssistantConversation from './useAiAssistantConversation';

const apiPath = '*ai_assistant_conversations/:id';

const conversation = {
  data: {
    id: 'conversation-1',
    type: 'ai_assistant_conversation',
    attributes: {
      context_key: 'survey_builder',
      locale: 'en',
      status: 'idle',
      last_error_code: null,
      created_at: '2026-10-01T08:00:00.000Z',
      updated_at: '2026-10-01T08:00:00.000Z',
    },
    relationships: { messages: { data: [] } },
  },
  included: [],
};

const server = setupServer(
  http.get(apiPath, () => HttpResponse.json(conversation, { status: 200 }))
);

describe('useAiAssistantConversation', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns the conversation', async () => {
    const { result } = renderHook(
      () => useAiAssistantConversation('conversation-1'),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.id).toBe('conversation-1');
  });

  it('does not fetch without an id', () => {
    const { result } = renderHook(() => useAiAssistantConversation(undefined), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => HttpResponse.json(null, { status: 500 }))
    );

    const { result } = renderHook(
      () => useAiAssistantConversation('conversation-1'),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
