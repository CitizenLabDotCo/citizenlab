import React from 'react';

import {
  IAiAssistantConversation,
  IAiAssistantConversationData,
} from 'api/ai_assistant_conversations/types';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import AssistantPanel from './AssistantPanel';

jest.mock('react-markdown', () => ({ children }: { children: string }) => (
  <p>{children}</p>
));

let mockConversation: IAiAssistantConversation | undefined;
jest.mock('api/ai_assistant_conversations/useAiAssistantConversations', () =>
  jest.fn(() => ({
    data: { data: mockConversation ? [mockConversation.data] : [] },
  }))
);
jest.mock('api/ai_assistant_conversations/useAiAssistantConversation', () =>
  jest.fn(() => ({ data: mockConversation }))
);
jest.mock('api/ai_assistant_conversations/useAddAiAssistantConversation', () =>
  jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false }))
);
const mockAddMessage = jest.fn();
jest.mock('api/ai_assistant_messages/useAddAiAssistantMessage', () =>
  jest.fn(() => ({ mutateAsync: mockAddMessage }))
);
const mockAddFile = jest.fn();
jest.mock('api/files/useAddFile', () =>
  jest.fn(() => ({ mutateAsync: mockAddFile }))
);
const mockDeleteFile = jest.fn();
jest.mock('api/files/useDeleteFile', () =>
  jest.fn(() => ({ mutateAsync: mockDeleteFile }))
);
jest.mock('api/ai_assistant_tool_calls/useApproveAiAssistantToolCall', () =>
  jest.fn(() => ({ mutate: jest.fn(), isPending: false, error: null }))
);
jest.mock('api/ai_assistant_tool_calls/useRejectAiAssistantToolCall', () =>
  jest.fn(() => ({ mutate: jest.fn(), isPending: false, error: null }))
);

const conversation = (
  attributes: IAiAssistantConversationData['attributes']
): IAiAssistantConversation => ({
  data: {
    id: 'conversation-1',
    type: 'ai_assistant_conversation',
    attributes,
    relationships: {
      messages: {
        data: [
          { id: 'message-1', type: 'ai_assistant_message' },
          { id: 'message-2', type: 'ai_assistant_message' },
        ],
      },
    },
  },
  included: [
    {
      id: 'message-1',
      type: 'ai_assistant_message',
      attributes: {
        role: 'user',
        content: 'Create a survey about our park.',
        file_ids: [],
        position: 1,
        created_at: '2026-10-01T08:00:00.000Z',
      },
      relationships: { tool_calls: { data: [] } },
    },
    {
      id: 'message-2',
      type: 'ai_assistant_message',
      attributes: {
        role: 'assistant',
        content: 'Here is a first draft.',
        file_ids: [],
        position: 2,
        created_at: '2026-10-01T08:00:10.000Z',
      },
      relationships: {
        tool_calls: {
          data: [{ id: 'call-1', type: 'ai_assistant_tool_call' }],
        },
      },
    },
    {
      id: 'call-1',
      type: 'ai_assistant_tool_call',
      attributes: {
        name: 'replace_form_fields',
        arguments: { fields: [] },
        status: 'proposed',
        reason: null,
        decided_at: null,
        created_at: '2026-10-01T08:00:10.000Z',
      },
    },
  ],
});

const baseAttributes = {
  surface_key: 'survey_builder',
  locale: 'en',
  turn_started_at: '2026-10-01T08:00:00.000Z',
  created_at: '2026-10-01T08:00:00.000Z',
  updated_at: '2026-10-01T08:00:00.000Z',
} as const;

const renderPanel = () =>
  render(
    <AssistantPanel
      surfaceKey="survey_builder"
      subjectId="phase-1"
      projectId="project-1"
      intro={{ id: 'test.intro', defaultMessage: 'Describe your survey' }}
      toolViews={{}}
      onToolExecuted={jest.fn()}
    />
  );

describe('AssistantPanel', () => {
  it('shows the intro before the first message', () => {
    mockConversation = undefined;
    renderPanel();

    expect(screen.getByText('Describe your survey')).toBeInTheDocument();
  });

  it('blocks new messages until the proposal is decided on', () => {
    mockConversation = conversation({
      ...baseAttributes,
      status: 'awaiting_approval',
      last_error_code: null,
    });
    renderPanel();

    expect(screen.getByText('Here is a first draft.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approve/ })).toBeInTheDocument();
    expect(
      screen.getByText('Approve or reject the proposed change to continue.')
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('lets the user start a new chat while the assistant works', () => {
    mockConversation = conversation({
      ...baseAttributes,
      status: 'running',
      last_error_code: null,
    });
    renderPanel();

    expect(
      screen.getByRole('button', { name: 'New chat' })
    ).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('times the work from the start of the turn', () => {
    jest.useFakeTimers({ now: new Date('2026-10-01T08:01:30.000Z') });
    mockConversation = conversation({
      ...baseAttributes,
      status: 'running',
      last_error_code: null,
      // Every message the turn stores moves updated_at.
      updated_at: '2026-10-01T08:01:20.000Z',
    });
    renderPanel();

    expect(screen.getByText('90 seconds')).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('deletes the uploaded files when the message could not be sent', async () => {
    mockConversation = conversation({
      ...baseAttributes,
      status: 'idle',
      last_error_code: null,
    });
    mockAddFile.mockResolvedValue({ data: { id: 'file-1' } });
    mockAddMessage.mockRejectedValue(new Error('Request failed'));
    const { container } = renderPanel();
    const fileInput = container.querySelector('input[type="file"]');
    if (!(fileInput instanceof HTMLInputElement)) {
      throw new Error('No file input');
    }

    await userEvent.type(screen.getByRole('textbox'), 'Use this brief.');
    await userEvent.upload(
      fileInput,
      new File(['%PDF-1.4'], 'brief.pdf', { type: 'application/pdf' })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => expect(mockDeleteFile).toHaveBeenCalledWith('file-1'));
  });

  it('shows why the last turn failed', () => {
    mockConversation = conversation({
      ...baseAttributes,
      status: 'failed',
      last_error_code: 'context_too_long',
    });
    renderPanel();

    expect(
      screen.getByText(
        'This chat has become too long. Start a new chat to continue.'
      )
    ).toBeInTheDocument();
  });
});
