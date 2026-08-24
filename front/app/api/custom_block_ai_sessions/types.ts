import { Keys } from 'utils/cl-react-query/types';

import customBlockAiSessionsKeys from './keys';

export type CustomBlockAiSessionsKeys = Keys<typeof customBlockAiSessionsKeys>;

export type AiToolName =
  | 'set_source'
  | 'set_manifest'
  | 'set_messages'
  | 'get_data_sample';

export interface ICustomBlockAiSessionData {
  id: string;
  type: 'custom_block_ai_session';
  attributes: {
    status: 'active' | 'closed';
    transcript_length: number;
    created_at: string;
  };
}

export interface ICustomBlockAiSession {
  data: ICustomBlockAiSessionData;
}

export interface IAddCustomBlockAiSession {
  customBlockId: string;
}

export interface IAiToolCall {
  id: string;
  name: AiToolName;
  input: Record<string, unknown>;
}

export interface IAiTurnData {
  id: string;
  type: 'custom_block_ai_turn';
  attributes: {
    assistant_text: string | null;
    tool_calls: IAiToolCall[];
    stop_reason: 'end_turn' | 'tool_use' | 'max_tokens' | string;
  };
}

export interface IAiTurn {
  data: IAiTurnData;
}

export interface IAiToolResult {
  tool_use_id: string;
  content: string;
  is_error?: boolean;
}

// Exactly one of user_message / tool_results must be present.
export interface IAddAiTurn {
  sessionId: string;
  user_message?: string;
  tool_results?: IAiToolResult[];
}
