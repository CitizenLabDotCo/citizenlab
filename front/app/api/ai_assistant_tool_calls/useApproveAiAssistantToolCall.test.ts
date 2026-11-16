import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useApproveAiAssistantToolCall from './useApproveAiAssistantToolCall';

const apiPath = '*ai_assistant_tool_calls/:id/approve';

const server = setupServer(
  http.post(apiPath, () =>
    HttpResponse.json(
      { data: { id: 'call-1', type: 'ai_assistant_tool_call' } },
      { status: 200 }
    )
  )
);

describe('useApproveAiAssistantToolCall', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('approves the tool call', async () => {
    const { result } = renderHook(() => useApproveAiAssistantToolCall(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 'call-1', conversationId: 'conversation-1' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () =>
        HttpResponse.json(
          { errors: { base: [{ error: 'tool_call_expired' }] } },
          { status: 422 }
        )
      )
    );

    const { result } = renderHook(() => useApproveAiAssistantToolCall(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 'call-1', conversationId: 'conversation-1' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
