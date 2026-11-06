import {
  AiAssistantToolCall,
  AiAssistantToolName,
  IAiAssistantToolCallData,
} from './types';

// A failed call can hold arguments the backend refused, so it never matches.
export const isToolCall = <Name extends AiAssistantToolName>(
  toolCall: IAiAssistantToolCallData,
  ...names: Name[]
): toolCall is AiAssistantToolCall<Name> =>
  toolCall.attributes.status !== 'failed' &&
  names.some((name) => name === toolCall.attributes.name);
