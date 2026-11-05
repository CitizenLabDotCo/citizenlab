import { AiAssistantToolCallStatus, IAiAssistantToolCallData } from './types';
import { isToolCall } from './utils';

const toolCall = (
  status: AiAssistantToolCallStatus
): IAiAssistantToolCallData => ({
  id: 'call-1',
  type: 'ai_assistant_tool_call',
  attributes: {
    name: 'replace_form_fields',
    arguments: { fields: [] },
    status,
    reason: null,
    decided_at: null,
    created_at: '2026-10-15T10:00:00Z',
  },
});

describe('isToolCall', () => {
  it('matches any of the given tools', () => {
    const call = toolCall('awaiting_user');

    expect(isToolCall(call, 'replace_form_fields')).toBe(true);
    expect(isToolCall(call, 'get_form_fields', 'replace_form_fields')).toBe(
      true
    );
    expect(isToolCall(call, 'get_form_fields')).toBe(false);
  });

  it('never matches a failed call', () => {
    expect(isToolCall(toolCall('failed'), 'replace_form_fields')).toBe(false);
  });
});
