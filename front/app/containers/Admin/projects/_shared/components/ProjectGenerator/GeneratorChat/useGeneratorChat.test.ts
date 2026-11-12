import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';

import { act, renderHook } from 'utils/testUtils/rtl';

import useGeneratorChat from './useGeneratorChat';

jest.mock('utils/cl-intl');
jest.mock('hooks/useLocale', () => jest.fn(() => 'en'));

const mockAddProject = jest.fn();
jest.mock('api/projects/useAddProject', () =>
  jest.fn(() => ({ mutateAsync: mockAddProject }))
);
const mockAddConversation = jest.fn();
jest.mock('api/ai_assistant_conversations/useAddAiAssistantConversation', () =>
  jest.fn(() => ({ mutateAsync: mockAddConversation }))
);
const mockAddMessage = jest.fn();
jest.mock('api/ai_assistant_messages/useAddAiAssistantMessage', () =>
  jest.fn(() => ({ mutateAsync: mockAddMessage }))
);
const mockReject = jest.fn();
jest.mock('api/ai_assistant_tool_calls/useRejectAiAssistantToolCall', () =>
  jest.fn(() => ({ mutateAsync: mockReject }))
);
const mockAddFile = jest.fn();
jest.mock('api/files/useAddFile', () =>
  jest.fn(() => ({ mutateAsync: mockAddFile }))
);
const mockDeleteFile = jest.fn();
jest.mock('api/files/useDeleteFile', () =>
  jest.fn(() => ({ mutateAsync: mockDeleteFile }))
);

const metadata = {
  status: 'awaiting_user',
  reason: null,
  decided_at: null,
  created_at: '2026-10-15T10:00:00Z',
} as const;

const createEvent = (id: string): IAiAssistantToolCallData => ({
  id,
  type: 'ai_assistant_tool_call',
  attributes: {
    name: 'create_event',
    arguments: {
      title_multiloc: { en: 'Walk along the street' },
      start_at: '2026-11-05T17:00:00',
      end_at: '2026-11-05T19:00:00',
    },
    ...metadata,
  },
});

const askUser: IAiAssistantToolCallData = {
  id: 'question',
  type: 'ai_assistant_tool_call',
  attributes: {
    name: 'ask_user',
    arguments: { questions: [] },
    ...metadata,
  },
};

const conversationWith = (
  toolCalls: IAiAssistantToolCallData[]
): IAiAssistantConversation => ({
  data: {
    id: 'conversation-1',
    type: 'ai_assistant_conversation',
    attributes: {
      status: toolCalls.length > 0 ? 'awaiting_user' : 'idle',
      last_error_code: null,
      turn_started_at: null,
      surface_key: 'project_generator',
      locale: 'en',
      auto_approve: false,
      created_at: '2026-10-15T10:00:00Z',
      updated_at: '2026-10-15T10:00:00Z',
    },
    relationships: {
      messages: { data: [{ id: 'message-1', type: 'ai_assistant_message' }] },
    },
  },
  included: [
    {
      id: 'message-1',
      type: 'ai_assistant_message',
      attributes: {
        role: 'assistant',
        content: 'Here is a first draft.',
        file_ids: [],
        position: 1,
        created_at: '2026-10-15T10:00:00Z',
      },
      relationships: {
        tool_calls: {
          data: toolCalls.map(({ id }) => ({
            id,
            type: 'ai_assistant_tool_call',
          })),
        },
      },
    },
    ...toolCalls,
  ],
});

const renderChat = (
  parameters: Partial<Parameters<typeof useGeneratorChat>[0]> = {}
) => {
  const onProjectCreated = jest.fn();
  const { result } = renderHook(() =>
    useGeneratorChat({
      isNewProject: false,
      autoApprove: false,
      onProjectCreated,
      ...parameters,
    })
  );

  return { result, onProjectCreated };
};

type Chat = ReturnType<typeof renderChat>['result'];

const write = async (chat: Chat, text: string) => {
  act(() => chat.current.setPrompt(text));
  await act(() => chat.current.send());
};

describe('useGeneratorChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddProject.mockResolvedValue({ data: { id: 'project-1' } });
    mockAddConversation.mockResolvedValue({ data: { id: 'conversation-1' } });
  });

  it('creates the draft with the first message about a new project', async () => {
    const { result, onProjectCreated } = renderChat({ isNewProject: true });

    await write(result, 'Redesign the market square.');

    expect(onProjectCreated).toHaveBeenCalledWith('project-1');
    expect(mockAddConversation).toHaveBeenCalledWith({
      surfaceKey: 'project_generator',
      subjectId: 'project-1',
      locale: 'en',
      autoApprove: false,
    });
    expect(mockAddMessage).toHaveBeenCalledWith({
      conversationId: 'conversation-1',
      content: 'Redesign the market square.',
      fileIds: [],
    });
    expect(result.current.prompt).toBe('');
  });

  it('starts the conversation in the chosen approval mode', async () => {
    const { result } = renderChat({
      projectId: 'project-2',
      autoApprove: true,
    });

    await write(result, 'Add a workshop in December.');

    expect(mockAddConversation).toHaveBeenCalledWith(
      expect.objectContaining({ autoApprove: true })
    );
  });

  it('starts a conversation about an existing project', async () => {
    const { result, onProjectCreated } = renderChat({
      projectId: 'project-2',
    });

    await write(result, 'Add a workshop in December.');

    expect(mockAddProject).not.toHaveBeenCalled();
    expect(onProjectCreated).not.toHaveBeenCalled();
    expect(mockAddConversation).toHaveBeenCalledWith(
      expect.objectContaining({ subjectId: 'project-2' })
    );
  });

  it('continues the conversation there is', async () => {
    const { result } = renderChat({
      projectId: 'project-2',
      conversation: conversationWith([]),
    });

    await write(result, 'Make it shorter.');

    expect(mockAddConversation).not.toHaveBeenCalled();
    expect(mockAddMessage).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 'conversation-1' })
    );
  });

  it('removes the uploads and keeps the text when a file fails', async () => {
    mockAddFile
      .mockResolvedValueOnce({ data: { id: 'file-1' } })
      .mockRejectedValueOnce(new Error('Upload failed'));
    const { result } = renderChat({ projectId: 'project-2' });

    act(() =>
      result.current.setFiles([
        new File(['brief'], 'brief.txt'),
        new File(['notes'], 'notes.txt'),
      ])
    );
    await write(result, 'Use these documents.');

    expect(mockDeleteFile).toHaveBeenCalledWith('file-1');
    expect(mockAddMessage).not.toHaveBeenCalled();
    expect(result.current.prompt).toBe('Use these documents.');
    expect(result.current.sendError).toBeDefined();
  });

  it('turns what the admin writes into a refinement of the proposed change', async () => {
    const { result } = renderChat({
      projectId: 'project-2',
      conversation: conversationWith([createEvent('call-1')]),
    });

    expect(result.current).toMatchObject({ blocked: false, refining: true });

    await write(result, 'Make it an hour earlier.');

    expect(mockReject).toHaveBeenCalledWith({
      id: 'call-1',
      conversationId: 'conversation-1',
      reason: 'Make it an hour earlier.',
    });
    expect(mockAddMessage).not.toHaveBeenCalled();
  });

  it('waits for the admin when several changes are proposed', () => {
    const { result } = renderChat({
      projectId: 'project-2',
      conversation: conversationWith([
        createEvent('call-1'),
        createEvent('call-2'),
      ]),
    });

    expect(result.current).toMatchObject({ blocked: true, refining: false });
  });

  it('waits for the answers to open questions', () => {
    const { result } = renderChat({
      projectId: 'project-2',
      conversation: conversationWith([askUser, createEvent('call-1')]),
    });

    expect(result.current).toMatchObject({ blocked: true, refining: false });
  });
});
