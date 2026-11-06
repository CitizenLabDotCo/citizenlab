import { AskUserArguments } from './tools/askUser';
import { CreateEventArguments } from './tools/createEvent';
import { CreatePhaseArguments } from './tools/createPhase';
import { DestroyResourceArguments } from './tools/destroyResource';
import { GetFormFieldsArguments } from './tools/getFormFields';
import { GetResourceArguments } from './tools/getResource';
import { ListAreasArguments } from './tools/listAreas';
import { ListGlobalTopicsArguments } from './tools/listGlobalTopics';
import { ListGroupsArguments } from './tools/listGroups';
import { ListPhasePermissionsArguments } from './tools/listPhasePermissions';
import { ReplaceFormFieldsArguments } from './tools/replaceFormFields';
import { UpdatePhaseArguments } from './tools/updatePhase';
import { UpdatePhasePermissionArguments } from './tools/updatePhasePermission';
import { UpdateProjectArguments } from './tools/updateProject';
import { UpdateResourceArguments } from './tools/updateResource';

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
  create_event: CreateEventArguments;
  create_phase: CreatePhaseArguments;
  destroy_resource: DestroyResourceArguments;
  get_form_fields: GetFormFieldsArguments;
  get_resource: GetResourceArguments;
  list_areas: ListAreasArguments;
  list_global_topics: ListGlobalTopicsArguments;
  list_groups: ListGroupsArguments;
  list_phase_permissions: ListPhasePermissionsArguments;
  replace_form_fields: ReplaceFormFieldsArguments;
  update_phase: UpdatePhaseArguments;
  update_phase_permission: UpdatePhasePermissionArguments;
  update_project: UpdateProjectArguments;
  update_resource: UpdateResourceArguments;
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

export type AiAssistantToolCall<Name extends AiAssistantToolName> = Extract<
  IAiAssistantToolCallData,
  { attributes: { name: Name } }
>;

export interface IAiAssistantToolCall {
  data: IAiAssistantToolCallData;
}
