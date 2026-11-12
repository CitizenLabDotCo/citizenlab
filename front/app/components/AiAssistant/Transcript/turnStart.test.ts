import { TranscriptEntry } from 'api/ai_assistant_conversations/constructTranscript';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';

import { getTurnStartId } from './turnStart';

const toolCall = (decidedAt: string | null): IAiAssistantToolCallData => ({
  id: `call-${decidedAt}`,
  type: 'ai_assistant_tool_call',
  attributes: {
    name: 'list_areas',
    arguments: {},
    status: decidedAt ? 'executed' : 'auto_executed',
    reason: null,
    decided_at: decidedAt,
    created_at: '2026-10-15T10:00:00Z',
  },
});

const entry = (
  id: string,
  role: 'user' | 'assistant',
  toolCalls: IAiAssistantToolCallData[] = []
): TranscriptEntry => ({
  message: {
    id,
    type: 'ai_assistant_message',
    attributes: {
      role,
      content: 'Text',
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
  toolCalls,
});

describe('getTurnStartId', () => {
  it("starts at the admin's last message", () => {
    const transcript = [
      entry('question', 'user'),
      entry('reply', 'assistant', [toolCall(null)]),
      entry('more', 'assistant'),
    ];

    expect(getTurnStartId(transcript)).toBe('question');
  });

  it("starts right after the admin's last decision", () => {
    const transcript = [
      entry('question', 'user'),
      entry('proposal', 'assistant', [toolCall('2026-10-15T10:05:00Z')]),
      entry('next', 'assistant'),
      entry('more', 'assistant'),
    ];

    expect(getTurnStartId(transcript)).toBe('next');
  });

  it('has no start until the reply to a decision comes in', () => {
    const transcript = [
      entry('question', 'user'),
      entry('proposal', 'assistant', [toolCall('2026-10-15T10:05:00Z')]),
    ];

    expect(getTurnStartId(transcript)).toBeUndefined();
  });
});
