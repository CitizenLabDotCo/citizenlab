import React from 'react';

import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';

import { render, screen } from 'utils/testUtils/rtl';

import ToolCallCard from './ToolCallCard';

const toolCall = (
  attributes: Partial<IAiAssistantToolCallData['attributes']> = {}
): IAiAssistantToolCallData => ({
  id: 'call-1',
  type: 'ai_assistant_tool_call',
  attributes: {
    name: 'get_form_fields',
    arguments: {},
    status: 'auto_executed',
    created_at: '2026-10-01T08:00:00.000Z',
    ...attributes,
  },
});

const view = {
  label: { id: 'test.label', defaultMessage: 'the current survey' },
};

describe('ToolCallCard', () => {
  it('shows the status of the call', () => {
    render(<ToolCallCard toolCall={toolCall()} view={view} />);

    expect(screen.getByText('Read: the current survey')).toBeInTheDocument();
  });

  it('falls back to the tool name without a view', () => {
    render(
      <ToolCallCard
        toolCall={toolCall({ status: 'failed' })}
        view={undefined}
      />
    );

    expect(screen.getByText('Failed: get_form_fields')).toBeInTheDocument();
  });
});
