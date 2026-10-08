export type AiAssistantToolCallStatus = 'pending' | 'auto_executed' | 'failed';

export interface IAiAssistantToolCallData {
  id: string;
  type: 'ai_assistant_tool_call';
  attributes: {
    name: string;
    arguments: Record<string, unknown>;
    status: AiAssistantToolCallStatus;
    created_at: string;
  };
}
