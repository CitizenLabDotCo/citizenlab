import { IRelationship, SupportedLocale } from 'typings';

import { IAiAssistantMessageData } from 'api/ai_assistant_messages/types';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';

import { Keys } from 'utils/cl-react-query/types';

import aiAssistantConversationsKeys from './keys';

export type AiAssistantConversationsKeys = Keys<
  typeof aiAssistantConversationsKeys
>;

export type AiAssistantContextKey = 'survey_builder';

export type AiAssistantErrorCode =
  | 'llm_unavailable'
  | 'llm_request_rejected'
  | 'context_too_long'
  | 'context_unavailable'
  | 'tool_budget_exceeded'
  | 'unexpected_error';

type ConversationState =
  | {
      status: 'idle' | 'running';
      last_error_code: null;
    }
  | { status: 'failed'; last_error_code: AiAssistantErrorCode };

export interface IAiAssistantConversationData {
  id: string;
  type: 'ai_assistant_conversation';
  attributes: ConversationState & {
    context_key: AiAssistantContextKey;
    locale: SupportedLocale;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    messages: { data: IRelationship[] };
  };
}

export interface IAiAssistantConversation {
  data: IAiAssistantConversationData;
  included: (IAiAssistantMessageData | IAiAssistantToolCallData)[];
}

export interface IAiAssistantConversations {
  data: IAiAssistantConversationData[];
}

export interface IAiAssistantConversationAdd {
  contextKey: AiAssistantContextKey;
  contextId: string;
  locale: SupportedLocale;
}
