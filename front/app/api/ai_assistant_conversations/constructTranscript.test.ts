import { IAiAssistantMessageData } from 'api/ai_assistant_messages/types';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';

import { constructTranscript } from './constructTranscript';
import { IAiAssistantConversation } from './types';

const message = (
  id: string,
  role: 'user' | 'assistant',
  toolCallIds: string[] = []
): IAiAssistantMessageData => ({
  id,
  type: 'ai_assistant_message',
  attributes: {
    role,
    content: id,
    file_ids: [],
    position: 1,
    created_at: '2026-10-01T08:00:00.000Z',
  },
  relationships: {
    tool_calls: {
      data: toolCallIds.map((toolCallId) => ({
        id: toolCallId,
        type: 'ai_assistant_tool_call',
      })),
    },
  },
});

const toolCall = (id: string): IAiAssistantToolCallData => ({
  id,
  type: 'ai_assistant_tool_call',
  attributes: {
    name: 'get_form_fields',
    arguments: {},
    status: 'auto_executed',
    reason: null,
    decided_at: null,
    created_at: '2026-10-01T08:00:00.000Z',
  },
});

describe('constructTranscript', () => {
  it('follows the order of the relationships, not of included', () => {
    const conversation: IAiAssistantConversation = {
      data: {
        id: 'conversation-1',
        type: 'ai_assistant_conversation',
        attributes: {
          status: 'idle',
          last_error_code: null,
          context_key: 'survey_builder',
          locale: 'en',
          created_at: '2026-10-01T08:00:00.000Z',
          updated_at: '2026-10-01T08:00:00.000Z',
        },
        relationships: {
          messages: {
            data: [
              { id: 'question', type: 'ai_assistant_message' },
              { id: 'answer', type: 'ai_assistant_message' },
            ],
          },
        },
      },
      included: [
        toolCall('call-2'),
        message('answer', 'assistant', ['call-1', 'call-2']),
        toolCall('call-1'),
        message('question', 'user'),
      ],
    };

    const transcript = constructTranscript(conversation);

    expect(transcript.map((entry) => entry.message.id)).toEqual([
      'question',
      'answer',
    ]);
    expect(transcript[0].toolCalls).toEqual([]);
    expect(transcript[1].toolCalls.map((call) => call.id)).toEqual([
      'call-1',
      'call-2',
    ]);
  });
});
