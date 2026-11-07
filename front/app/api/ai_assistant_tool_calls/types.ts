import { AskUserArguments } from './tools/askUser';
import { GetFormFieldsArguments } from './tools/getFormFields';
import { ReplaceFormFieldsArguments } from './tools/replaceFormFields';
import { UpdateProjectArguments } from './tools/updateProject';

export type AiAssistantToolCallStatus =
  | 'pending'
  | 'auto_executed'
  | 'awaiting_user'
  | 'approved'
  | 'executed'
  | 'failed'
  | 'rejected'
  | 'expired';

export type AiAssistantAnswer = { question: string; answer: string };

// The arguments of each tool, as stored once the backend validated them.
export type AiAssistantToolArguments = {
  ask_user: AskUserArguments;
  get_form_fields: GetFormFieldsArguments;
  replace_form_fields: ReplaceFormFieldsArguments;
  update_project: UpdateProjectArguments;
};

export type AiAssistantToolName = keyof AiAssistantToolArguments;

type ToolCall<Name extends AiAssistantToolName> = {
  id: string;
  type: 'ai_assistant_tool_call';
  attributes: {
    name: Name;
    arguments: AiAssistantToolArguments[Name];
    status: AiAssistantToolCallStatus;
    reason: string | null;
    decided_at: string | null;
    created_at: string;
    // The user's answers, once they answered the assistant's questions.
    answers?: AiAssistantAnswer[] | null;
  };
};

export type IAiAssistantToolCallData = {
  [Name in AiAssistantToolName]: ToolCall<Name>;
}[AiAssistantToolName];

export interface IAiAssistantToolCall {
  data: IAiAssistantToolCallData;
}
