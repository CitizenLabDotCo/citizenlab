import React from 'react';

import {
  IAiAssistantConversation,
  IAiAssistantConversationData,
} from 'api/ai_assistant_conversations/types';

import { render, screen } from 'utils/testUtils/rtl';

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
jest.mock('api/ai_assistant_messages/useAddAiAssistantMessage', () =>
  jest.fn(() => ({ mutateAsync: jest.fn() }))
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
  context_key: 'survey_builder',
  locale: 'en',
  created_at: '2026-10-01T08:00:00.000Z',
  updated_at: '2026-10-01T08:00:00.000Z',
} as const;

const renderPanel = () =>
  render(
    <AssistantPanel
      contextKey="survey_builder"
      contextId="phase-1"
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
