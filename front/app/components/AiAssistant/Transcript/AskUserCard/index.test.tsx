import React from 'react';

import { IAiAssistantConversation } from 'api/ai_assistant_conversations/types';
import {
  AiAssistantAnswer,
  AiAssistantToolCallStatus,
  IAiAssistantToolCallData,
} from 'api/ai_assistant_tool_calls/types';

import { render, screen, fireEvent } from 'utils/testUtils/rtl';

import AskUserCard from '.';

const mockAnswer = jest.fn();

jest.mock('api/ai_assistant_tool_calls/useAnswerAiAssistantToolCall', () =>
  jest.fn(() => ({ mutate: mockAnswer, isPending: false, error: null }))
);

const toolCall = (
  status: AiAssistantToolCallStatus = 'awaiting_user',
  answers?: AiAssistantAnswer[]
): IAiAssistantToolCallData => ({
  id: 'call-1',
  type: 'ai_assistant_tool_call',
  attributes: {
    name: 'ask_user',
    arguments: {
      questions: [
        {
          question: 'When should it start?',
          options: ['This month', 'Next month'],
        },
        {
          question: 'Who is it for?',
          options: ['Residents', 'Businesses'],
          multi_select: true,
        },
      ],
    },
    status,
    answers,
    reason: null,
    decided_at: null,
    created_at: '2026-10-15T08:00:00.000Z',
  },
});

const conversation = (
  status: 'awaiting_user' | 'running'
): IAiAssistantConversation => ({
  data: {
    id: 'conversation-1',
    type: 'ai_assistant_conversation',
    attributes: {
      status,
      last_error_code: null,
      turn_started_at: '2026-10-15T08:00:00.000Z',
      surface_key: 'survey_builder',
      auto_approve: false,
      locale: 'en',
      created_at: '2026-10-15T08:00:00.000Z',
      updated_at: '2026-10-15T08:00:00.000Z',
    },
    relationships: { messages: { data: [] } },
  },
  included: [],
});

describe('AskUserCard', () => {
  beforeEach(() => mockAnswer.mockReset());

  it('sends the picked and written answers of every question together', () => {
    render(
      <AskUserCard
        toolCall={toolCall()}
        conversation={conversation('awaiting_user')}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }));
    fireEvent.click(screen.getByRole('button', { name: 'Residents' }));
    fireEvent.click(screen.getByRole('button', { name: 'Businesses' }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Schools' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Send answers' }));

    expect(mockAnswer).toHaveBeenCalledWith({
      id: 'call-1',
      conversationId: 'conversation-1',
      answers: [
        { question: 'When should it start?', answer: 'Next month' },
        {
          question: 'Who is it for?',
          answer: 'Residents, Businesses, Schools',
        },
      ],
    });
  });

  it('shows the given answers once the questions are answered', () => {
    render(
      <AskUserCard
        toolCall={toolCall('executed', [
          { question: 'When should it start?', answer: 'Next month' },
        ])}
        conversation={conversation('running')}
      />
    );

    expect(screen.getByText('Next month')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Send answers' })
    ).not.toBeInTheDocument();
  });
});
