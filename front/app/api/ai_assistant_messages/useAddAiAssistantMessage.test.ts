import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useAddAiAssistantMessage from './useAddAiAssistantMessage';

const apiPath = '*ai_assistant_conversations/:conversationId/messages';

const server = setupServer(
  http.post(apiPath, () =>
    HttpResponse.json(
      { data: { id: 'message-1', type: 'ai_assistant_message' } },
      { status: 201 }
    )
  )
);

describe('useAddAiAssistantMessage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('sends the message', async () => {
    let requestBody: unknown;
    server.use(
      http.post(apiPath, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(
          { data: { id: 'message-1', type: 'ai_assistant_message' } },
          { status: 201 }
        );
      })
    );

    const { result } = renderHook(() => useAddAiAssistantMessage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        conversationId: 'conversation-1',
        content: 'Create a survey',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestBody).toEqual({
      ai_assistant_message: { content: 'Create a survey' },
    });
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () =>
        HttpResponse.json(
          { errors: { base: [{ error: 'conversation_busy' }] } },
          { status: 409 }
        )
      )
    );

    const { result } = renderHook(() => useAddAiAssistantMessage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        conversationId: 'conversation-1',
        content: 'Create a survey',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
