import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useUpdateAiAssistantConversation from './useUpdateAiAssistantConversation';

const apiPath = '*ai_assistant_conversations/conversation-1';

const server = setupServer();

describe('useUpdateAiAssistantConversation', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('switches the approval mode of the conversation', async () => {
    let requestBody: unknown;
    server.use(
      http.patch(apiPath, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(
          { data: { id: 'conversation-1', type: 'ai_assistant_conversation' } },
          { status: 200 }
        );
      })
    );

    const { result } = renderHook(() => useUpdateAiAssistantConversation(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 'conversation-1', autoApprove: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestBody).toEqual({
      ai_assistant_conversation: { auto_approve: true },
    });
  });
});
