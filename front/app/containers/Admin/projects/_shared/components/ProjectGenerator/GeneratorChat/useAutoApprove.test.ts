import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';

import { act, renderHook } from 'utils/testUtils/rtl';

import useAutoApprove from './useAutoApprove';

const mockUpdateConversation = jest.fn();
jest.mock(
  'api/ai_assistant_conversations/useUpdateAiAssistantConversation',
  () =>
    jest.fn(() => ({
      mutate: mockUpdateConversation,
      isPending: false,
      variables: undefined,
    }))
);

const conversation = (autoApprove: boolean): IAiAssistantConversation => ({
  data: {
    id: 'conversation-1',
    type: 'ai_assistant_conversation',
    attributes: {
      status: 'idle',
      last_error_code: null,
      turn_started_at: null,
      surface_key: 'project_generator',
      locale: 'en',
      auto_approve: autoApprove,
      created_at: '2026-10-15T10:00:00Z',
      updated_at: '2026-10-15T10:00:00Z',
    },
    relationships: { messages: { data: [] } },
  },
  included: [],
});

describe('useAutoApprove', () => {
  beforeEach(() => jest.clearAllMocks());

  it('keeps the choice until there is a conversation to store it', () => {
    const { result } = renderHook(() => useAutoApprove(undefined));

    expect(result.current.autoApprove).toBe(false);
    act(() => result.current.setAutoApprove(true));

    expect(result.current.autoApprove).toBe(true);
    expect(mockUpdateConversation).not.toHaveBeenCalled();
  });

  it('stores the choice on the conversation', () => {
    const { result } = renderHook(() => useAutoApprove(conversation(true)));

    expect(result.current.autoApprove).toBe(true);
    act(() => result.current.setAutoApprove(false));

    expect(mockUpdateConversation).toHaveBeenCalledWith({
      id: 'conversation-1',
      autoApprove: false,
    });
  });
});
