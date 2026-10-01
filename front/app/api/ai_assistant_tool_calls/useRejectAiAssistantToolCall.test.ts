import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useRejectAiAssistantToolCall from './useRejectAiAssistantToolCall';

const apiPath = '*ai_assistant_tool_calls/:id/reject';

const toolCall = { data: { id: 'call-1', type: 'ai_assistant_tool_call' } };

const server = setupServer(
  http.post(apiPath, () => HttpResponse.json(toolCall, { status: 200 }))
);

describe('useRejectAiAssistantToolCall', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('sends the reason', async () => {
    let requestBody: unknown;
    server.use(
      http.post(apiPath, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(toolCall, { status: 200 });
      })
    );

    const { result } = renderHook(() => useRejectAiAssistantToolCall(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: 'call-1',
        conversationId: 'conversation-1',
        reason: 'Fewer questions',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestBody).toEqual({
      ai_assistant_tool_call: { reason: 'Fewer questions' },
    });
  });
});
