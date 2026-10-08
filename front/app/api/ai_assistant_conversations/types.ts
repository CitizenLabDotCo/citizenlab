import { ILinks, IRelationship, SupportedLocale } from 'typings';

import { IAiAssistantMessageData } from 'api/ai_assistant_messages/types';
import { IAiAssistantToolCallData } from 'api/ai_assistant_tool_calls/types';

import { Keys } from 'utils/cl-react-query/types';

import aiAssistantConversationsKeys from './keys';

export type AiAssistantConversationsKeys = Keys<
  typeof aiAssistantConversationsKeys
>;

export type AiAssistantSurfaceKey = 'survey_builder';

export type AiAssistantErrorCode =
  | 'llm_unavailable'
  | 'llm_request_rejected'
  | 'context_too_long'
  | 'surface_unavailable'
  | 'tool_budget_exceeded'
  | 'unexpected_error';

type ConversationState =
  | {
      status: 'idle' | 'awaiting_approval';
      last_error_code: null;
      turn_started_at: string | null;
    }
  | { status: 'running'; last_error_code: null; turn_started_at: string }
  | {
      status: 'failed';
      last_error_code: AiAssistantErrorCode;
      turn_started_at: string | null;
    };

export interface IAiAssistantConversationData {
  id: string;
  type: 'ai_assistant_conversation';
  attributes: ConversationState & {
    surface_key: AiAssistantSurfaceKey;
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

export interface IAiAssistantConversationsParameters {
  surfaceKey: AiAssistantSurfaceKey;
  subjectId: string;
  pageSize?: number;
}

export interface IAiAssistantConversations {
  data: IAiAssistantConversationData[];
  links: ILinks;
}

export interface IAiAssistantConversationAdd {
  surfaceKey: AiAssistantSurfaceKey;
  subjectId: string;
  locale: SupportedLocale;
}
