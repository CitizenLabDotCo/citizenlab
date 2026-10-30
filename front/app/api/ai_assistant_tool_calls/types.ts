export type AiAssistantToolCallStatus =
  | 'pending'
  | 'auto_executed'
  | 'proposed'
  | 'approved'
  | 'executed'
  | 'failed'
  | 'rejected'
  | 'expired';

export interface IAiAssistantToolCallData {
  id: string;
  type: 'ai_assistant_tool_call';
  attributes: {
    name: string;
    arguments: Record<string, unknown>;
    status: AiAssistantToolCallStatus;
    reason: string | null;
    decided_at: string | null;
    created_at: string;
  };
}

export interface IAiAssistantToolCall {
  data: IAiAssistantToolCallData;
}
