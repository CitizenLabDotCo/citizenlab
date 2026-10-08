import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useAddAiAssistantConversation from './useAddAiAssistantConversation';

const apiPath = '*ai_assistant_conversations';

const server = setupServer(
  http.post(apiPath, () =>
    HttpResponse.json(
      { data: { id: 'conversation-1', type: 'ai_assistant_conversation' } },
      { status: 201 }
    )
  )
);

describe('useAddAiAssistantConversation', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('starts a conversation about the context', async () => {
    let requestBody: unknown;
    server.use(
      http.post(apiPath, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(
          { data: { id: 'conversation-1', type: 'ai_assistant_conversation' } },
          { status: 201 }
        );
      })
    );

    const { result } = renderHook(() => useAddAiAssistantConversation(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        contextKey: 'survey_builder',
        contextId: 'phase-1',
        locale: 'en',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestBody).toEqual({
      ai_assistant_conversation: {
        context_key: 'survey_builder',
        context_id: 'phase-1',
        locale: 'en',
      },
    });
  });
});
