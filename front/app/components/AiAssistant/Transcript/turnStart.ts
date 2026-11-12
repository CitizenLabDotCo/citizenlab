import { TranscriptEntry } from 'api/ai_assistant_conversations/constructTranscript';

// The latest turn starts at the admin's last message, or right after their last decision.
export const getTurnStartId = (transcript: TranscriptEntry[]) => {
  for (let index = transcript.length - 1; index >= 0; index--) {
    const { message, toolCalls } = transcript[index];

    if (message.attributes.role === 'user') return message.id;

    const decided = toolCalls.some(({ attributes }) => attributes.decided_at);
    if (decided) return transcript.at(index + 1)?.message.id;
  }

  return undefined;
};
