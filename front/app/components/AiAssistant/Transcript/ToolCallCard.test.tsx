import React from 'react';

import {
  AiAssistantToolCallStatus,
  IAiAssistantToolCallData,
} from 'api/ai_assistant_tool_calls/types';

import { render, screen, fireEvent, waitFor } from 'utils/testUtils/rtl';

import ToolCallCard from './ToolCallCard';

const mockApprove = jest.fn();
const mockReject = jest.fn();

jest.mock('api/ai_assistant_tool_calls/useApproveAiAssistantToolCall', () =>
  jest.fn(() => ({ mutate: mockApprove, isPending: false, error: null }))
);
jest.mock('api/ai_assistant_tool_calls/useRejectAiAssistantToolCall', () =>
  jest.fn(() => ({ mutate: mockReject, isPending: false, error: null }))
);

const toolCall = (
  status: AiAssistantToolCallStatus = 'awaiting_user'
): IAiAssistantToolCallData => ({
  id: 'call-1',
  type: 'ai_assistant_tool_call',
  attributes: {
    name: 'replace_form_fields',
    arguments: { fields: [] },
    status,
    reason: null,
    decided_at: null,
    created_at: '2026-10-01T08:00:00.000Z',
  },
});

const display = {
  label: { id: 'test.label', defaultMessage: 'new survey questions' },
  Preview: () => <div>Outline preview</div>,
};

describe('ToolCallCard', () => {
  beforeEach(() => {
    mockApprove.mockReset();
    mockReject.mockReset();
  });

  it('shows the preview of a proposed change and approves it', () => {
    const onExecuted = jest.fn();
    mockApprove.mockImplementation((_variables, { onSuccess }) =>
      onSuccess({ data: toolCall('executed') })
    );

    render(
      <ToolCallCard
        toolCall={toolCall()}
        conversationId="conversation-1"
        decidable
        display={display}
        onExecuted={onExecuted}
      />
    );

    expect(screen.getByText('Outline preview')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Approve/ }));

    expect(mockApprove).toHaveBeenCalledWith(
      { id: 'call-1', conversationId: 'conversation-1' },
      expect.anything()
    );
    expect(onExecuted).toHaveBeenCalledWith('replace_form_fields');
  });

  it('does not report a failed approval as executed', () => {
    const onExecuted = jest.fn();
    mockApprove.mockImplementation((_variables, { onSuccess }) =>
      onSuccess({ data: toolCall('failed') })
    );

    render(
      <ToolCallCard
        toolCall={toolCall()}
        conversationId="conversation-1"
        decidable
        display={display}
        onExecuted={onExecuted}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Approve/ }));

    expect(onExecuted).not.toHaveBeenCalled();
  });

  it('rejects with a reason', async () => {
    render(
      <ToolCallCard
        toolCall={toolCall()}
        conversationId="conversation-1"
        decidable
        display={display}
        onExecuted={jest.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Fewer questions' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Reject and tell the assistant' })
    );

    await waitFor(() =>
      expect(mockReject).toHaveBeenCalledWith({
        id: 'call-1',
        conversationId: 'conversation-1',
        reason: 'Fewer questions',
      })
    );
  });

  it('only shows the status of calls that cannot be decided on', () => {
    render(
      <ToolCallCard
        toolCall={toolCall('executed')}
        conversationId="conversation-1"
        decidable={false}
        display={display}
        onExecuted={jest.fn()}
      />
    );

    expect(
      screen.getByText('Applied: new survey questions')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Approve/ })).toBeNull();
  });
});
